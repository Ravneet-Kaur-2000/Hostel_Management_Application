const express=require("express");
const bodyparser=require("body-parser");
require("dotenv").config();
const app=express();

const path=require('path');
const db=require('./database.js');

app.set("view engine","ejs");
app.set("views","views");

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res,next)=>{
    db.execute("DELETE FROM student_hostel where room_no is NULL")
    .then(([rows,fieldData])=>{
        res.render("landing",{title:"Hostels",path:"/"});
    })
    .catch(err=>{ 
        console.log(err);
    });
   
})

app.get('/info/:clg',(req,res,next)=>{
    const college=req.params.clg;
    db.execute("SELECT * FROM hostel_info inner join college_hostel on hostel_info.identity=college_hostel.key")
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render('info',{title:"Prices" ,clg:college,userData:rows,path:"/info"});
    })
    .catch(err=>{ 
        console.log(err);
    });
})

const authRouter=require('./routes/auth');
const studentRouter=require('./routes/student');
const adminRouter=require('./routes/admin');

app.use(authRouter);
app.use(studentRouter);
app.use(adminRouter);


app.listen(3000);


