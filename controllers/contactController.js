exports.processContact = (req, res) => {
    const { firstName, lastName, email } = req.body;

    // Validation
    if (!firstName || !lastName || !email) {
        req.flash('error_msg', 'Tous les champs sont obligatoires');
        return res.redirect('/contact');
    }

    // Stockage dans la session pour la page de notification
    req.session.notificationData = { firstName, lastName, email };
    
    // Message flash
    req.flash('success_msg', `Merci ${firstName} pour votre message!`);
    
    res.redirect('/notification');
};

exports.notification = (req, res) => {
    const { firstName, lastName, email } = req.session.notificationData || {};
    
    if (!firstName) {
        req.flash('error_msg', 'Session expirée, veuillez remplir à nouveau le formulaire');
        return res.redirect('/contact');
    }

    res.render('notification', {
        pageTitle: 'Confirmation',
        firstName,
        lastName,
        email,
        // Transfert explicite des messages flash
        success_msg: req.flash('success_msg'),
        error_msg: req.flash('error_msg')
    });
};