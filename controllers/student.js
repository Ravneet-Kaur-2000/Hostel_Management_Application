const db=require('../database.js');


exports.getStudentDetails=(req,res,next)=>{
    const id=req.params.id;
    const email_id=req.params.email;
    console.log(id);
    db.execute("SELECT rooms.id,college_hostel.college,sum(counter) as total_counter from rooms join college_hostel on rooms.id=college_hostel.key where college_hostel.college = ? group by rooms.id",[id])
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render("get-student-details",{title:"Student Details",path:"/get-student-details",clg:id,hostel:rows,email_id:email_id});
    })
    .catch(err=>{ 
        console.log(err);
    });
}


exports.postgetStudentDetails=(req,res,next)=>{
    const user=req.body;
    console.log(user);
    const str=user.hostel;
    const email=req.body.email_real;
    const clg=req.body.clg;
    const hostel = Number(str.match(/(\d+)/)[0]);
    console.log(user);
    const userDetail=[user.name,user.gender,email,user.course,user.erp,user.year,user.contact,user.pname,user.econtact,hostel];
    db.execute("INSERT INTO student_hostel(name,gender,email,course,erp,year,contact,pname,econtact,hostel,mess) VALUES(?,?,?,?,?,?,?,?,?,?,'Yes')",userDetail)
    .then(() =>{ 
        res.redirect("/occupancy/"+email+"/"+clg+"/"+hostel);
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("Some Error Occured");location.href="/login"</script>');
    });
}


exports.getOccupancy=(req,res,next)=>{
    const hostel_id=req.params.hostel;
    const email_id=req.params.email;
    const clg=req.params.clg;
    db.execute("SELECT rooms.id,rooms.room_type,college_hostel.college,college_hostel.hostel_no, sum(counter) as total_count from rooms join college_hostel on rooms.id=college_hostel.key where college_hostel.college = ? and college_hostel.hostel_no=? and rooms.counter>0 group by rooms.room_type",[clg,hostel_id])
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render("occupancy",{title:"Student Details",path:"/get-student-details",email:email_id,hostel_no:hostel_id,clg:clg,details:rows});
    })
    .catch(err=>{ 
        console.log(err);
    });
}

exports.postOccupancy=(req,res,next)=>{
    const occ=req.body.occ;
    const email=req.body.email;
    console.log(occ);
    console.log(email);
    db.execute("UPDATE student_hostel SET occupancy =? WHERE email = ?",[occ,email])
    .then(() =>{
        return db.execute("SELECT student.college,student_hostel.hostel from student join student_hostel on student.email=student_hostel.email where student.email = ?",[email])
    })
    .then(([rows,fieldData])=>{
        res.redirect("/room/"+email+"/"+rows[0].college+"/"+rows[0].hostel+"/"+occ);
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("Some Error Occured");location.href="/login"</script>');
    });
}


exports.getRoom=(req,res,next)=>{
    const hostel_id=req.params.hostel;
    const email_id=req.params.email;
    const clg=req.params.clg;
    const occ=req.params.occ;
    console.log(hostel_id);
    console.log(occ);
    let details;
    db.execute("SELECT rooms.id,rooms.room_type,rooms.floor,rooms.room_no,college_hostel.college,college_hostel.hostel_no,rooms.counter from rooms join college_hostel on rooms.id=college_hostel.key where college_hostel.college = ? and college_hostel.hostel_no= ? and rooms.room_type=? and rooms.counter>0 ",[clg,hostel_id,occ])
    .then(([rows,fieldData])=>{
        details=rows;
        return db.execute("SELECT college_hostel.college,college_hostel.mess,hostel_info.facility,hostel_info.price,hostel_info.identity from college_hostel join hostel_info on hostel_info.identity=college_hostel.key where college_hostel.college = ? and college_hostel.hostel_no=? and hostel_info.facility=?",[clg,hostel_id,occ])
    })
    .then(([rows1,fieldData])=>{
        console.log(details);
        console.log(rows1);
        let x=Number(rows1[0].price) + Number(rows1[0].mess);
        console.log(x);
        res.render("room",{title:"Student Details",path:"/get-student-details",email:email_id,hostel_no:hostel_id,clg:clg,details:details,price:x});
    })
    .catch(err=>{ 
        console.log(err);
    });
}


exports.postRoom=(req,res,next)=>{
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
    db.execute("UPDATE student_hostel SET floor=? , room_no=?, price=? WHERE email = ?",[floor,room,price,email])
    .then(() =>{
        return db.execute("UPDATE rooms SET counter = counter - 1 WHERE room_no = ? and id= ?",[room,id])
    })
    .then(() =>{ 
        res.send('<script>alert("Room alloacted Successfully");location.href="/"</script>');
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("The room cannot be allocated due to some issue");location.href="/login"</script>');
    });
}

exports.getProfile=(req,res,next)=>{
    const email_id=req.params.email;
    db.execute("SELECT * from student_hostel inner join student on student_hostel.email=student.email where student_hostel.email = ?",[email_id])
    .then(([rows,fieldData])=>{
        res.render("profile",{title:"Profile",path:"/profile",details:rows[0]});
    })
    .catch(err=>{ 
            console.log(err);
    });
    
}


exports.getComplaint=(req,res,next)=>{
    const email_id=req.params.email;
    res.render("complaint",{title:"Complaint",path:"/complaint",email:email_id});
}


exports.postComplaint=(req,res,next)=>{
    const user=req.body;
    console.log(user);
    const email_id=req.body.email_real;
    const complaint=user.complaint;
    db.execute("INSERT INTO complaints(issue,email) VALUES(?,?)",[complaint,email_id])
    .then(([rows,fieldData])=>{
        res.send('<script>alert("Complaint filed successfully");location.href="/complaint/'+email_id+'"</script>');
    })
    .catch(err=>{ 
        console.log(err);
    });
    
}

exports.getReallocate=(req,res,next)=>{
    const email_id=req.params.email;
    let details;
    let college;
    db.execute("SELECT * from student inner join student_hostel on student_hostel.email=student.email where student_hostel.email = ?",[email_id])
    .then(([rows1,fieldData])=>{
        console.log(rows1)
        college=rows1[0].college;
        details=rows1[0];
        return db.execute("SELECT college_hostel.college,college_hostel.hostel_no,rooms.id,sum(rooms.counter) as total_counter from college_hostel inner join rooms on college_hostel.key=rooms.id where college_hostel.college = ? group by college_hostel.hostel_no",[college])
    })
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render("reallocate",{title:"Reallocation of Room",path:"/reallocate",details:details,hostel:rows,email:email_id,clg:college});
    })
    .catch(err=>{ 
        console.log(err);
    });
}


exports.postReallocate=(req,res,next)=>{
    const user=req.body;
    console.log(user);
    const email_id=req.body.email_real;
    const college=user.college;
    const str=user.hostel;
    const hostel = Number(str.match(/(\d+)/)[0]);
    db.execute("SELECT college_hostel.college,college_hostel.hostel_no,rooms.id,rooms.room_type,rooms.floor,rooms.room_no,rooms.counter from college_hostel inner join rooms on college_hostel.key=rooms.id where college_hostel.college = ? and college_hostel.hostel_no=? and rooms.counter>0 order by rooms.room_type",[college,hostel])
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render("reallocate-rooms",{title:"Rooms Selection",path:"/rooms",email:email_id,rooms:rows});
    })
    .catch(err=>{ 
            console.log(err);
    });
    
}

exports.getChange=(req,res,next)=>{
    const email=req.params.email;
    const room_no=req.params.room_no;
    const hostel_no=req.params.hostel_no;
    const occ=req.params.occ;
    const floor=req.params.floor
    console.log(occ);
    console.log(hostel_no);
    let clg;
    db.execute("SELECT * from student_hostel inner join student on student.email=student_hostel.email where student.email=?",[email])
    .then(([rows,fieldData])=>{
        console.log(rows);
        clg=rows[0].college;
        console.log(clg);
        return db.execute("UPDATE rooms inner join college_hostel on rooms.id=college_hostel.key SET counter=counter+1 where college=? and rooms.room_no=? and hostel_no=? ",[rows[0].college,rows[0].room_no,rows[0].hostel])
    })
    .then(()=>{
        return db.execute("SELECT college_hostel.college,college_hostel.mess,hostel_info.facility,hostel_info.price,hostel_info.identity from college_hostel inner join hostel_info on hostel_info.identity=college_hostel.key where college_hostel.college = ? and college_hostel.hostel_no=? and hostel_info.facility=?",[clg,hostel_no,occ])
    })
    .then(([rows1,fieldData]) =>{
        console.log(rows1);
        let x=Number(rows1[0].price) + Number(rows1[0].mess);
        return db.execute("UPDATE student_hostel SET hostel=? ,floor=? , room_no=?, occupancy=?, price=? WHERE email = ?",[hostel_no,floor,room_no,occ,x,email])
    })
    .then(()=>{
        db.execute("UPDATE rooms inner join college_hostel on rooms.id=college_hostel.key  SET counter=counter-1  where college=? and rooms.room_no=? and hostel_no=? ",[clg,room_no,hostel_no])
        res.send('<script>alert("Room reallocated successfully. You will be contacted regarding the price shortly");location.href="/profile/'+email+'"</script>');
    })
    .catch(err=>{ 
            console.log(err);
    });

}