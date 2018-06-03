var axios = require('axios');
module.exports = function (app, passport, con, bcrypt) {

    app.post('/api/login', passport.authenticate('local'), (req, res, next) => {
        if (req.user) {
            var redir = { redirect: "/" };
            return res.json(redir);
        }
    });
    app.post('/api/sendvacationapplication', (req, res, next) => {
        con.query("INSERT INTO vacation (choice_no, description, emp_no, created, period,vacation_no,start_date,end_date,status) VALUES (?,?,?,?,?,?,?,?,?)",
            [req.body.choice_no, req.body.description, req.user, req.body.created, req.body.period, req.body.vacation_no, req.body.start_date, req.body.end_date, req.body.status], function (err, result, fields) {
                if (err) throw err;
            });
    });
    app.post('/api/createvacationperiod', (req, res, next) => {
        con.query("INSERT INTO vacation_period (name, start_date, end_date, open_status) VALUES (?,?,?,?)", [req.body.title, req.body.range_picker[0], req.body.range_picker[1], req.body.modifier], function (err, result, fields) {
            if (err) throw err;
        });
    });
    app.post('/api/deletevacationperiod', (req, res, next) => {
        con.query("DELETE FROM vacation_period WHERE id=?", [req.body.id], function (err, result, fields) {
            if (err) throw err;
        });
    });
    app.post('/api/deletevacation', (req, res, next) => {
        con.query("DELETE FROM vacation WHERE id=?", [req.body.id], function (err, result, fields) {
            if (err) throw err;
        });
    });
    app.post('/api/deletevacations', (req, res, next) => {
        console.log(req.user)
        console.log(req.body.period )
        con.query("DELETE FROM vacation WHERE emp_no=? AND period =?", [req.user,req.body.period ], function (err, result, fields) {
            if (err) throw err;
        });
    });
    app.post('/api/editvacation', (req, res, next) => {
        if (req.body.status !== undefined) {
            con.query("UPDATE vacation SET status = ? WHERE id=?", [req.body.status, req.body.id], function (err, result, fields) {
                if (err) throw err;
            });
        }
        if (req.body.start_date !== undefined && req.body.end_date !== undefined) {
            con.query("UPDATE vacation SET start_date = ?, end_date = ? WHERE id=?", [req.body.start_date, req.body.end_date, req.body.id], function (err, result, fields) {
                if (err) throw err;
            });
        }

    });
    app.post('/api/editvacationperiod', (req, res, next) => {
        if (req.body.name !== undefined) {
            con.query("UPDATE vacation_period SET name = ?, start_date = ?, end_date = ? WHERE id=?",
                [req.body.name, req.body.start_date, req.body.end_date, req.body.id],
                function (err, result, fields) {
                    if (err) throw err;
                });
        }
        if (req.body.openstatus !== undefined) {
            con.query("UPDATE vacation_period SET open_status = ? WHERE id=?", [req.body.openstatus, req.body.id], function (err, result, fields) {
                if (err) throw err;
            });
        }

    });
    app.post('/api/createuser', (req, res, next) => {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
            con.query("INSERT INTO users (emp_no, first_name, last_name, email, hire_date, location, password, status) VALUES (?,?,?,?,?,?,?,?)",
                [req.body.emp_no, req.body.first_name, req.body.last_name, req.body.email, req.body.hire_date, req.body.location, hash, req.body.status], function (err, result, fields) {
                    if (err) throw err;
                    res.send(result);
                });
        });
    });
    app.post('/api/createqualification', (req, res, next) => {
        con.query("INSERT INTO competence_group (emp_no, id) VALUES (?,?)",
            [req.body.emp_no, req.body.qualification], function (err, result, fields) {
                if (err) throw err;
            });
    });
    app.post('/api/editstaffmembers', (req, res, next) => {
        con.query("UPDATE users AS u SET u.email = ?, u.first_name = ?, u.last_name = ?, u.location = ?, u.status = ? WHERE emp_no = ?",
            [req.body.target.email, req.body.target.first_name, req.body.target.last_name, req.body.target.location, req.body.target.status, req.body.target.emp_no], function (err, result, fields) {
                if (err) throw err;
            });

    });
    app.get('/api/getstaffmembers', (req, res, next) => {
        con.query("SELECT u.email, u.hire_date, u.first_name, u.last_name, u.location, u.emp_no, u.status FROM users AS u", function (err, result, fields) {
            if (err) throw err;
            res.send(result);

        });
    });
    app.get('/api/getallqualifications', (req, res, next) => {
        con.query("SELECT * FROM qualification", function (err, result, fields) {
            if (err) throw err;
            res.send(result);

        });
    });
    app.get('/api/getqualifications', (req, res, next) => {
        con.query("SELECT competence_group.emp_no, qualification.title, qualification.id FROM competence_group LEFT JOIN qualification ON competence_group.id = qualification.id", function (err, result, fields) {
            if (err) throw err;
            res.send(result);

        });
    });
    app.post('/api/editqualifications', (req, res, next) => {
        con.query("DELETE FROM competence_group WHERE emp_no = ?", [req.body.emp_no], function (err, result, fields) {
            req.body.qualifications.forEach((qualification) => {
                con.query("INSERT INTO competence_group (emp_no,id) VALUES (?,?)", [req.body.emp_no, qualification], function (err, result, fields) {
                    if (err) throw err;
                });
            });
        });

    });
    // app.post('/api/deletequalifications', (req, res, next) => {
    //     con.query("DELETE FROM competence_group WHERE emp_no = ?", [req.body.emp_no], function (err, result, fields) {
    //         if (err) throw err;

    //     });
    // });
    // app.post('/api/addqualifications', (req, res, next) => {

    //     con.query("INSERT INTO competence_group (emp_no,id) VALUES (?,?)", [req.body.emp_no, req.body.id], function (err, result, fields) {
    //         if (err) throw err;
    //     });

    // });
    app.get('/api/getapplications', (req, res, next) => {
        if (req.query.period !== undefined) {
            con.query("SELECT status FROM users WHERE emp_no = ?", [req.user], function (err, result, fields) {
                if (err) throw err;
                if (result[0].status == 1) {
                    con.query("SELECT * FROM vacation WHERE period = ? AND emp_no = ?", [req.query.period, req.user], function (err, result, fields) {
                        if (err) throw err;
                        res.send(result);

                    });
                }
                if (result[0].status == 2) {
                    con.query("SELECT * FROM vacation WHERE period = ?", [req.query.period], function (err, result, fields) {
                        if (err) throw err;
                        res.send(result);

                    });
                }
            });

        } else {
            con.query("SELECT vacation_period.name, v.choice_no, v.description, v.vacation_no, v.start_date, v.end_date, v.status, v.emp_no, v.id FROM vacation AS v LEFT JOIN vacation_period ON v.period=vacation_period.ID", function (err, result, fields) {
                if (err) throw err;
                res.send(result);

            });
        }
    });
    app.get('/api/getvacations', (req, res, next) => {
        con.query("SELECT status FROM users WHERE emp_no = ?", [req.user], function (err, result, fields) {
            if (err) throw err;
            if (result[0].status == 1) {
                con.query("SELECT vacation_period.name, v.choice_no, v.description, v.vacation_no, v.start_date, v.end_date, v.status FROM vacation AS v INNER JOIN vacation_period ON v.period=vacation_period.ID WHERE v.emp_no = ?;", [req.user], function (err, result, fields) {
                    if (err) throw err;
                    res.send(result);

                });
            }
            if (result[0].status == 2) {
                con.query("SELECT v.choice_no, v.description, v.vacation_no, v.start_date, v.end_date, v.status, v.emp_no, v.id FROM vacation AS v WHERE v.period = ? ;", [req.query.period], function (err, result, fields) {
                    if (err) throw err;
                    res.send(result);

                });
            }
        });
    });
    app.get('/api/getvacationperiods', (req, res, next) => {
        con.query("SELECT status FROM users WHERE emp_no = ?", [req.user], function (err, result, fields) {
            if (err) throw err;
            if (result[0].status === 1) {
                // con.query("SELECT v.id, v.name, v.start_date, v.end_date, vacation.status FROM vacation_period AS v LEFT JOIN vacation ON v.id = vacation.period WHERE v.open_status = 1", function (err, result, fields) {
                //     if (err) throw err;
                //     res.send(result);
                // });
                con.query("SELECT v.id, v.name, v.start_date, v.end_date FROM vacation_period AS v WHERE v.open_status = 1", function (err, result, fields) {
                    if (err) throw err;
                    res.send(result);
                    // var values = [];

                    // for (i = 0; i < result.length; i++) {
                    //     console.log("v" + values[i].id);
                    //     con.query("SELECT * FROM vacation WHERE period = ?", [result[i].id], function (err, result2, fields) {
                    //         if (err) throw err;
                    //         console.log("a" + result2.length);
                    //         console.log("b" + result[i]);
                    //         if (result2.length === 0) {
                    //             values[i] = {
                    //                 id: result[i].id,
                    //                 name: result[i].name,
                    //                 start_date: result[i].start_date,
                    //                 end_date: result[i].end_date,
                    //                 status: 0
                    //             }
                    //         } else {
                    //             values[i] = {
                    //                 id: result[i].id,
                    //                 name: result[i].name,
                    //                 start_date: result[i].start_date,
                    //                 end_date: result[i].end_date,
                    //                 status: 1
                    //             }
                    //         }
                    //         console.log(values);
                    //         // res.send(values);
                    //     });
                    // }

                });
            }
            if (result[0].status === 2) {
                con.query("SELECT * FROM vacation_period", function (err, result, fields) {
                    if (err) throw err;
                    res.send(result);
                });
            }
        });
    });
    app.get('/api/logout', (req, res) => {
        req.logout();
        req.session.destroy(() => {
            res.clearCookie('connect.sid')
        })


    });


    app.get('/api/getstatus', (req, res) => {
        if (req.user == undefined) {

            res.send({ status: 0 });
        }
        else {
            con.query("SELECT status, first_name, last_name FROM users WHERE emp_no = ?", [req.user], function (err, result, fields) {
                if (err) throw err;
                res.send(result[0]);
            });
        }

    });
    app.get('/api/myvacations', (req, res) => {
        con.query("SELECT * FROM vacation WHERE emp_no = ?", [req.user], function (err, result, fields) {
            if (err) throw err;
            res.send(result);
        });
    });
    app.get('/api/applications', (req, res) => {
        con.query("SELECT * FROM vacation", function (err, result, fields) {
            if (err) throw err;
            res.send(result);
        });
    });



}