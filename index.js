const express=require("express");
const bodyparser=require("body-parser");
require("dotenv").config();
const app=express();

const db=require('./database.js');

app.set("view engine","ejs");
app.set("views","views");

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

app.get('/',(req,res,next)=>{
    db.execute("DELETE FROM student_hostel where room_no is NULL").then(([rows,fieldData])=>{
        res.render("landing",{title:"Hostels",path:"/"});
    })
    .catch(err=>{ 
        console.log(err);
    });
   
})

app.get('/info/:clg',(req,res,next)=>{
    const college=req.params.clg;
    db.execute("SELECT * FROM hostel_info inner join college_hostel on hostel_info.identity=college_hostel.key").then(([rows,fieldData])=>{
        console.log(rows);
        res.render('info',{title:"Prices" ,clg:college,userData:rows,path:"/info"});
    })
    .catch(err=>{ 
        console.log(err);
    });
})

app.get('/signup',(req,res,next)=>{
    res.render("signup",{title:"Sign Up",path:"/signup"});
})

app.post('/signup',(req,res)=>{
    const user=req.body;
    console.log(user);
    const userDetail=[user.college,user.email,user.password];
    console.log(userDetail);
    db.execute("INSERT INTO student (college,email, password) VALUES(?,?,?)",userDetail).then(() =>{ 
        res.send('<script>alert("User added successfully!!");location.href="/"</script>');
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("The user with the same email already exists");location.href="/login"</script>');
    });
})


app.get('/login',(req,res,next)=>{
    res.render("login",{title:"Login",path:"/login"});
})

app.post('/login',(req,res,next)=>{
    const user=req.body;
    const email_id=user.email;
    const pass=user.password;
    let id;
    console.log(email_id);
    db.execute("SELECT * FROM student WHERE email = ? " ,[email_id]).then(([rows,fieldData])=>{ 
        if(pass==rows[0].password){
            db.execute("SELECT student.email from student_hostel inner join student on student_hostel.email=student.email where student_hostel.email = ?",[email_id]).then(([rows1,fieldData])=>{
                console.log(rows1[0]);
                if(rows1[0]===undefined)
                {
                    if(rows[0].college==='MIT World Peace University')
                    {
                    res.redirect("/get-student-details/MIT World Peace University/"+email_id);
                    }
                    else if(rows[0].college==='Savitribai Phule Pune University' )
                    {
                    res.redirect("/get-student-details/Savitribai Phule Pune University/"+email_id);
                    }
                    else if(rows[0].college==='Cummins College of Engineering for Girls')
                    {
                        res.redirect("/get-student-details/Cummins College of Engineering for Girls/"+email_id);
                    }
                }
                else
                {
                    console.log("in");
                    res.redirect("/profile/"+email_id);
                } 
                console.log("Successful");
                })
                .catch(err=>{ 
                    console.log(err);
                });
            
            
            
        }
        else{
            res.send('<script>alert("Incorrect Details");location.href="/login"</script>');
        }
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("User does not exist");location.href="/signup"</script>');
    });
})


app.get('/get-student-details/:id/:email',(req,res,next)=>{
    const id=req.params.id;
    const email_id=req.params.email;
    console.log(id);
    db.execute("SELECT rooms.id,college_hostel.college,rooms.counter from rooms join college_hostel on rooms.id=college_hostel.key where college_hostel.college = ?",[id]).then(([rows,fieldData])=>{
        res.render("get-student-details",{title:"Student Details",path:"/get-student-details",clg:id,hostel:rows,email_id:email_id});
    })
    .catch(err=>{ 
        console.log(err);
    });
})

app.post('/get-student-details',(req,res,next)=>{
    const user=req.body;
    console.log(user);
    const str=user.hostel;
    const email=req.body.email_real;
    const clg=req.body.clg;
    const hostel = Number(str.match(/(\d+)/)[0]);
    console.log(user);
    const userDetail=[user.name,user.gender,email,user.course,user.erp,user.year,user.contact,user.pname,user.econtact,hostel];
    db.execute("INSERT INTO student_hostel(name,gender,email,course,erp,year,contact,pname,econtact,hostel,mess) VALUES(?,?,?,?,?,?,?,?,?,?,'Yes')",userDetail).then(() =>{ 
        res.redirect("/occupancy/"+email+"/"+clg+"/"+hostel);
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("Some Error Occured");location.href="/login"</script>');
    });
})

app.get('/occupancy/:email/:clg/:hostel',(req,res,next)=>{
    const hostel_id=req.params.hostel;
    const email_id=req.params.email;
    const clg=req.params.clg;
    db.execute("SELECT rooms.id,rooms.room_type,college_hostel.college,college_hostel.hostel_no,rooms.counter from rooms join college_hostel on rooms.id=college_hostel.key where college_hostel.college = ? and college_hostel.hostel_no=? and rooms.counter>0",[clg,hostel_id]).then(([rows,fieldData])=>{
        console.log(rows);
        res.render("occupancy",{title:"Student Details",path:"/get-student-details",email:email_id,hostel_no:hostel_id,clg:clg,details:rows});
    })
    .catch(err=>{ 
        console.log(err);
    });
})


app.post('/occupancy',(req,res,next)=>{
    const occ=req.body.occ;
    const email=req.body.email;
    console.log(occ);
    console.log(email);
    db.execute("UPDATE student_hostel SET occupancy =? WHERE email = ?",[occ,email]).then(() =>{
        db.execute("SELECT student.college,student_hostel.hostel from student join student_hostel on student.email=student_hostel.email where student.email = ?",[email]).then(([rows,fieldData])=>{
             res.redirect("/room/"+email+"/"+rows[0].college+"/"+rows[0].hostel+"/"+occ);
        })
        .catch(err=>{ 
            console.log(err);
        });
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("Some Error Occured");location.href="/login"</script>');
    });
})

app.get('/room/:email/:clg/:hostel/:occ',(req,res,next)=>{
    const hostel_id=req.params.hostel;
    const email_id=req.params.email;
    const clg=req.params.clg;
    const occ=req.params.occ;
    console.log(hostel_id);
    console.log(occ);
    db.execute("SELECT rooms.id,rooms.room_type,rooms.floor,rooms.room_no,college_hostel.college,college_hostel.hostel_no,rooms.counter from rooms join college_hostel on rooms.id=college_hostel.key where college_hostel.college = ? and college_hostel.hostel_no= ? and rooms.room_type=? and rooms.counter>0 ",[clg,hostel_id,occ]).then(([rows,fieldData])=>{
        db.execute("SELECT college_hostel.college,college_hostel.mess,hostel_info.facility,hostel_info.price,hostel_info.identity from college_hostel join hostel_info on hostel_info.identity=college_hostel.key where college_hostel.college = ? and college_hostel.hostel_no=? and hostel_info.facility=?",[clg,hostel_id,occ]).then(([rows1,fieldData])=>{
            console.log(rows);
            console.log(rows1);
            let x=Number(rows1[0].price) + Number(rows1[0].mess);
            console.log(x);
            res.render("room",{title:"Student Details",path:"/get-student-details",email:email_id,hostel_no:hostel_id,clg:clg,details:rows,price:x});
        })
        .catch(err=>{ 
            console.log(err);
        });
    })
    .catch(err=>{ 
        console.log(err);
    });
})

app.post('/room',(req,res,next)=>{
    const user=req.body
    const str=user.room;
    const email=req.body.email;
    const id=req.body.id;
    const price=req.body.price;
    console.log(id);
    const room_floor =(str.match(/\d+/g));
    const room=room_floor[0];
    const floor=room_floor[1];
    console.log(room);
    console.log(floor);
    console.log(email);
    db.execute("UPDATE student_hostel SET floor=? , room_no=?, price=? WHERE email = ?",[floor,room,price,email]).then(() =>{
        db.execute("UPDATE rooms SET counter = counter - 1 WHERE room_no = ? and id= ?",[room,id]).then(() =>{ 
            res.send('<script>alert("Room alloacted Successfully");location.href="/"</script>');
        })
        .catch(err=>{ 
            console.log(err);
            res.send('<script>alert("The room cannot be allocated due to some issue");location.href="/login"</script>');
        });
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("Some Error Occured");location.href="/login"</script>');
    });
})

app.get('/profile/:email',(req,res,next)=>{
    const email_id=req.params.email;
    db.execute("SELECT * from student_hostel inner join student on student_hostel.email=student.email where student_hostel.email = ?",[email_id]).then(([rows,fieldData])=>{
        res.render("profile",{title:"Profile",path:"/profile",details:rows[0]});
    })
    .catch(err=>{ 
            console.log(err);
    });
    
})

app.get('/complaint/:email',(req,res,next)=>{
    const email_id=req.params.email;
    res.render("complaint",{title:"Complaint",path:"/complaint",email:email_id});
})


app.post('/complaint',(req,res,next)=>{
    const user=req.body;
    console.log(user);
    const email_id=req.body.email_real;
    const complaint=user.complaint;
    db.execute("INSERT INTO complaints(issue,email) VALUES(?,?)",[complaint,email_id]).then(([rows,fieldData])=>{
        res.send('<script>alert("Complaint filed successfully");location.href="/complaint/'+email_id+'"</script>');
        })
        .catch(err=>{ 
            console.log(err);
        });
    
})

app.get('/reallocate/:email',(req,res,next)=>{
    const email_id=req.params.email;
    db.execute("SELECT college from student_hostel email = ?",[email_id]).then(([rows,fieldData])=>{
        db.execute("SELECT * from hostel_info inner join rooms on .email=student.email where student_hostel.email = ?",[email_id]).then(([rows,fieldData])=>{
            
            res.render("reallocate",{title:"Reallocation of Room",path:"/reallocate",details:rows[0],email:email_id});
        })
        .catch(err=>{ 
                console.log(err);
        });
        })
        .catch(err=>{ 
            console.log(err);
        });
    
})

app.listen(3000);


