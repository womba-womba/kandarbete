var LocalStrategy = require('passport-local').Strategy;


module.exports = function (passport, con, bcrypt) {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            
            con.query("SELECT password FROM users WHERE emp_no = ?", [username], function (err, results, fields) {
                if (err) { done(err) };
                
                if (results.length === 0) {
                    done(null, false);
                }
                else {
                    
                    const hash = results[0].password.toString();
                    bcrypt.compare(password, hash, function (err, response) {
                        if (response === true) {
                            return done(null, username);              
                        }
                        else {
                            return done(null, false);
                            
                        }
                    });
                }

            });

        }
    ));
    passport.serializeUser(function (user_id, done) {
        done(null, user_id);
    });

    passport.deserializeUser(function (user_id, done) {

        done(null, user_id);

    });
}