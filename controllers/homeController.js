// Données des cours (seront remplacées par une base de données plus tard)
const courses = [
    {
      title: "Introduction à l'IA",
      description: "Découvrez les fondamentaux de l'intelligence artificielle.",
      price: 199,
      level: "Débutant"
    },
    {
      title: "Machine Learning Fondamental",
      description: "Apprenez les principes du machine learning et les algorithmes de base.",
      price: 299,
      level: "Intermédiaire"
    },
    {
      title: "Deep Learning Avancé",
      description: "Maîtrisez les réseaux de neurones profonds et leurs applications.",
      price: 399,
      level: "Avancé"
    }
  ];
  
  // Page d'accueil (inchangée)
  exports.index = (req, res) => {
    res.render("index", { 
      pageTitle: "Accueil",
      currentPath: req.path
    });
  };
  
  // Page À propos (inchangée)
  exports.about = (req, res) => {
    res.render("about", { 
      pageTitle: "À propos",
      currentPath: req.path
    });
  };
  
  // Page des cours (inchangée)
  exports.courses = (req, res) => {
    res.render("courses", {
      pageTitle: "Nos Cours",
      courses: courses,
      currentPath: req.path
    });
  };
  
  // Page de contact (inchangée)
  exports.contact = (req, res) => {
    res.render("contact", { 
      pageTitle: "Contact",
      currentPath: req.path,
      formData: req.flash('formData')[0] || {}, // Nouveau: pour pré-remplissage
      error_msg: req.flash('error_msg') // Nouveau: pour afficher les erreurs
    });
  };
  
  // Traitement du formulaire de contact (AMÉLIORÉ)
  exports.processContact = (req, res) => {
    const { firstName, lastName, email, message } = req.body;
    const errors = [];
  
    // Validation améliorée
    if (!firstName || firstName.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }
  
    if (!lastName || lastName.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }
  
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Veuillez entrer une adresse email valide');
    }
  
    if (message && message.length > 500) {
      errors.push('Le message ne doit pas dépasser 500 caractères');
    }
  
    // Gestion des erreurs
    if (errors.length > 0) {
      req.flash('error_msg', errors);
      req.flash('formData', req.body); // Sauvegarde les données saisies
      return res.redirect('/contact');
    }
  
    // Si validation OK
    req.session.notificationData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      message: message ? message.trim() : '',
      timestamp: new Date()
    };
  
    res.redirect('/notification');
  };
  
  // Page de notification dédiée (AMÉLIORÉE)
  exports.notification = (req, res) => {
    const notificationData = req.session.notificationData || {};
    
    // Vérification renforcée des données
    if (!notificationData.firstName) {
      req.flash('error_msg', 'Session expirée, veuillez remplir le formulaire');
      return res.redirect('/contact');
    }
  
    // Formatage amélioré de la date
    const contactDate = notificationData.timestamp.toLocaleString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  
    res.render('notification', {
      pageTitle: 'Confirmation de réception',
      firstName: notificationData.firstName,
      lastName: notificationData.lastName,
      email: notificationData.email,
      message: notificationData.message,
      contactDate,
      currentPath: req.path
    });
  };
  
  // Page FAQ (inchangée)
  exports.faq = (req, res) => {
    const faqs = [
      {
        question: "Quels sont les prérequis pour les cours ?",
        answer: "Nos cours débutants ne nécessitent aucun prérequis technique."
      },
      {
        question: "Puis-je obtenir un certificat ?",
        answer: "Oui, tous nos cours délivrent un certificat de réussite."
      },
      {
        question: "Les cours sont-ils à vie ?",
        answer: "Oui, un accès à vie est inclus pour tous les cours achetés."
      },
      {
        question: "Proposez-vous des remboursements ?",
        answer: "Nous offrons un remboursement sous 30 jours si vous n'êtes pas satisfait."
      },
      {
        question: "Comment contacter le support ?",
        answer: "Via notre page de contact ou à support@ai-academy.com"
      }
    ];
    
    res.render("faq", {
      pageTitle: "FAQ",
      faqs: faqs,
      currentPath: req.path
    });
  };