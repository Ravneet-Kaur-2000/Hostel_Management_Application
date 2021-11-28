const db=require('../database.js');

exports.getSignUp=(req,res,next)=>{
    res.render("signup",{title:"Sign Up",path:"/signup"});
}

exports.postSignUp=(req,res)=>{
    const user=req.body;
    console.log(user);
    const userDetail=[user.college,user.email,user.password];
    console.log(userDetail);
    db.execute("INSERT INTO student (college,email, password) VALUES(?,?,?)",userDetail)
    .then(() =>{ 
        res.send('<script>alert("User added successfully!!");location.href="/"</script>');
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("The user with the same email already exists");location.href="/login"</script>');
    });
}


exports.getLogin=(req,res,next)=>{
    res.render("login",{title:"Login",path:"/login"});
}

exports.postLogin=(req,res,next)=>{
    const user=req.body;
    const email_id=user.email;
    const pass=user.password;
    let id;
    let row;
    console.log(email_id);
    console.log(process.env.ADMIN_EMAIL)
    if(email_id==process.env.ADMIN_EMAIL && pass===process.env.ADMIN_PASSWORD)
    {
        res.redirect("/viewStudents");
    }
    else{
        db.execute("SELECT * FROM student WHERE email = ? " ,[email_id])
    .then(([rows,fieldData])=>{ 
        row=rows;
        if(pass==rows[0].password){
            return db.execute("SELECT student.email from student_hostel inner join student on student_hostel.email=student.email where student_hostel.email = ?",[email_id])
        }
    })
    .then(([rows1,fieldData])=>{
        console.log(rows1[0]);
        if(rows1[0]===undefined)
        {
            if(row[0].college==='MIT World Peace University')
            {
                res.redirect("/get-student-details/MIT World Peace University/"+email_id);
            }
            else if(row[0].college==='Savitribai Phule Pune University' )
            {
                 res.redirect("/get-student-details/Savitribai Phule Pune University/"+email_id);
            }
            else if(row[0].college==='Cummins College of Engineering for Girls')
            {
                res.redirect("/get-student-details/Cummins College of Engineering for Girls/"+email_id);
            }
        }
        else
        {
            console.log("in");
            res.redirect("/profile/"+email_id);
        }
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("User does not exist or incorrect details entered");location.href="/signup"</script>');
    });
    }
    
}