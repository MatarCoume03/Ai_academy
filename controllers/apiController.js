const User = require("../models/user");
const Course = require("../models/course");
const Subscriber = require("../models/subscriber");
const httpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { body, validationResult } = require('express-validator');

// Configuration centralisée
const jwtConfig = {
  secret: process.env.TOKEN_KEY || "secretTokenKey",
  expiresIn: '24h'
};

// Helpers
const buildError = (status, message, details = null) => ({
  success: false,
  error: { status, message, details }
});

const buildSuccess = (data, status = httpStatus.OK) => ({
  success: true,
  status,
  data
});

// Contrôleur principal
module.exports = {
  /* ==================== */
  /*  MIDDLEWARES         */
  /* ==================== */
  verifyToken: async (req, res, next) => {
    try {
      if (req.path === "/login" || req.path === "/documentation") return next();

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(httpStatus.UNAUTHORIZED)
          .json(buildError(httpStatus.UNAUTHORIZED, "Token manquant ou invalide"));
      }

      const token = authHeader.split(" ")[1];
      const decoded = await jwt.verify(token, jwtConfig.secret);
      const user = await User.findById(decoded.data).select('-password');
      
      if (!user) {
        return res.status(httpStatus.FORBIDDEN)
          .json(buildError(httpStatus.FORBIDDEN, "Utilisateur non trouvé"));
      }

      req.user = user;
      next();
    } catch (error) {
      const status = error.name === "TokenExpiredError" 
        ? httpStatus.UNAUTHORIZED 
        : httpStatus.FORBIDDEN;
      
      res.status(status)
        .json(buildError(status, "Échec de l'authentification", error.message));
    }
  },

  /* ==================== */
  /*  AUTHENTIFICATION    */
  /* ==================== */
  apiAuthenticate: (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(httpStatus.UNAUTHORIZED)
          .json(buildError(httpStatus.UNAUTHORIZED, info?.message || "Authentification échouée"));
      }

      const token = jwt.sign(
        { data: user._id },
        jwtConfig.secret,
        { expiresIn: jwtConfig.expiresIn }
      );

      res.json(buildSuccess({
        token,
        user: {
          id: user._id,
          name: user.fullName,
          email: user.email
        }
      }));
    })(req, res, next);
  },

  /* ==================== */
  /*  UTILISATEURS        */
  /* ==================== */
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find({}).select('-password');
      res.json(buildSuccess(users));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Utilisateur non trouvé"));
      }
      res.json(buildSuccess(user));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  createUser: [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('first').notEmpty().trim(),
    body('last').notEmpty().trim(),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(httpStatus.BAD_REQUEST)
            .json(buildError(httpStatus.BAD_REQUEST, "Validation échouée", errors.array()));
        }

        const user = await User.register(new User({
          name: {
            first: req.body.first,
            last: req.body.last
          },
          email: req.body.email,
          zipCode: req.body.zipCode
        }), req.body.password);

        res.status(httpStatus.CREATED)
          .json(buildSuccess(user, httpStatus.CREATED));
      } catch (error) {
        const status = error.name === 'UserExistsError' 
          ? httpStatus.CONFLICT 
          : httpStatus.INTERNAL_SERVER_ERROR;
        
        res.status(status)
          .json(buildError(status, error.message));
      }
    }
  ],

  updateUser: async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            'name.first': req.body.first,
            'name.last': req.body.last,
            email: req.body.email,
            zipCode: req.body.zipCode
          }
        },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Utilisateur non trouvé"));
      }

      res.json(buildSuccess(user));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Utilisateur non trouvé"));
      }
      res.json(buildSuccess({ message: "Utilisateur supprimé avec succès" }));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  /* ==================== */
  /*  COURS               */
  /* ==================== */
  getAllCourses: async (req, res) => {
    try {
      const courses = await Course.find({});
      res.json(buildSuccess(courses));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  getCourseById: async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (!course) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Cours non trouvé"));
      }
      res.json(buildSuccess(course));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  createCourse: async (req, res) => {
    try {
      const course = await Course.create({
        title: req.body.title,
        description: req.body.description,
        maxStudents: req.body.maxStudents,
        cost: req.body.cost
      });
      res.status(httpStatus.CREATED)
        .json(buildSuccess(course, httpStatus.CREATED));
    } catch (error) {
      res.status(httpStatus.BAD_REQUEST)
        .json(buildError(httpStatus.BAD_REQUEST, "Données invalides", error.message));
    }
  },

  updateCourse: async (req, res) => {
    try {
      const course = await Course.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            maxStudents: req.body.maxStudents,
            cost: req.body.cost
          }
        },
        { new: true }
      );

      if (!course) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Cours non trouvé"));
      }

      res.json(buildSuccess(course));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  deleteCourse: async (req, res) => {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);
      if (!course) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Cours non trouvé"));
      }
      res.json(buildSuccess({ message: "Cours supprimé avec succès" }));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  /* ==================== */
  /*  ABONNÉS             */
  /* ==================== */
  getAllSubscribers: async (req, res) => {
    try {
      const subscribers = await Subscriber.find({});
      res.json(buildSuccess(subscribers));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  getSubscriberById: async (req, res) => {
    try {
      const subscriber = await Subscriber.findById(req.params.id);
      if (!subscriber) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Abonné non trouvé"));
      }
      res.json(buildSuccess(subscriber));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  createSubscriber: async (req, res) => {
    try {
      const { name, email, zipCode } = req.body;
      
      if (!name || !email) {
        return res.status(httpStatus.BAD_REQUEST)
          .json(buildError(httpStatus.BAD_REQUEST, "Nom et email requis"));
      }

      const subscriber = await Subscriber.create({ name, email, zipCode });
      res.status(httpStatus.CREATED)
        .json(buildSuccess(subscriber, httpStatus.CREATED));
    } catch (error) {
      const status = error.code === 11000 
        ? httpStatus.CONFLICT 
        : httpStatus.INTERNAL_SERVER_ERROR;
      
      const message = error.code === 11000 
        ? "Cet email est déjà utilisé" 
        : "Erreur serveur";
      
      res.status(status)
        .json(buildError(status, message, error.message));
    }
  },

  updateSubscriber: async (req, res) => {
    try {
      const subscriber = await Subscriber.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            zipCode: req.body.zipCode
          }
        },
        { new: true }
      );

      if (!subscriber) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Abonné non trouvé"));
      }

      res.json(buildSuccess(subscriber));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  },

  deleteSubscriber: async (req, res) => {
    try {
      const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
      if (!subscriber) {
        return res.status(httpStatus.NOT_FOUND)
          .json(buildError(httpStatus.NOT_FOUND, "Abonné non trouvé"));
      }
      res.json(buildSuccess({ message: "Abonné supprimé avec succès" }));
    } catch (error) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .json(buildError(httpStatus.INTERNAL_SERVER_ERROR, "Erreur serveur", error.message));
    }
  }
};