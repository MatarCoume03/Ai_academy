const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcrypt");
const passportLocalMongoose = require("passport-local-mongoose");
const userSchema = new Schema(
{
name: {
first: {
type: String,
trim: true
},
last: {
type: String,
trim: true
}
},
email: {
type: String,
required: true,
lowercase: true,
unique: true
},
zipCode: {
type: Number,
min: [10000, "Code postal trop court"],
max: 99999
},
password: {
type: String,
required: true
},
courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
subscribedAccount: { type: Schema.Types.ObjectId, ref: "Subscriber" }
},
{
timestamps: true
}
);
// Attribut virtuel pour le nom complet
userSchema.virtual("fullName").get(function() {
return `${this.name.first} ${this.name.last}`;
});
// Hook pre-save pour le hashage du mot de passe
userSchema.pre("save", function(next) {
let user = this;
if (!user.isModified("password")) return next();
bcrypt.hash(user.password, 10)
.then(hash => {
user.password = hash;
next();
})
.catch(error => {
console.log(`Erreur de hachage du mot de passe: ${error.message}`);
next(error);
});
});
// Hook pre-save pour associer un abonné à l'utilisateur
userSchema.pre("save", function(next) {
let user = this;
if (user.subscribedAccount === undefined) {
mongoose.model("Subscriber").findOne({ email: user.email })
.then(subscriber => {
user.subscribedAccount = subscriber;
next();
})
.catch(error => {
console.log(`Erreur lors de la connexion avec l'abonné: ${error.message}`);
next(error);
});
} else {
next();
}
});
// Méthode pour comparer les mots de passe
userSchema.methods.passwordComparison = function(inputPassword) {
let user = this;
return bcrypt.compare(inputPassword, user.password);
};
// Ajouter le plugin passport-local-mongoose
userSchema.plugin(passportLocalMongoose, {
    usernameField: "email"
    });
module.exports = mongoose.model("User", userSchema);