const db=require('../database.js');

exports.viewStudents=(req,res,next)=>{
    db.execute("SELECT * FROM student inner join student_hostel on student.email=student_hostel.email")
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render('viewStudents',{title:"Students" ,userData:rows,path:"/viewStudents"});
    })
    .catch(err=>{ 
        console.log(err);
    });
}

exports.viewComplaints=(req,res,next)=>{
    db.execute("SELECT * FROM student inner join complaints ON complaints.email=student.email inner join student_hostel ON student.email=student_hostel.email")
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render('viewComplaints',{title:"Complaints",userComplaints:rows,path:'/viewComplaints'});
    })
    .catch(err=>{ 
        console.log(err);
    });
}

exports.getAddRoom=(req,res,next)=>{
    res.render("addNewRoom",{title:"Add New Room",path:"/addNewRoom"});
}

exports.postAddRoom=(req,res,next)=>{
    const room=req.body;
    console.log(room);
    const floor=room.floor;
    const room_no=room.room_no;
    const room_type=room.room_type;
    const counter=room.counter;
    let id;
    db.execute("SELECT * FROM college_hostel where college=? and hostel_no=?",[room.college,room.hostel_no])
    .then(([rows,fieldData])=>{
        console.log(rows);
        id=rows[0].key;
        return db.execute("INSERT INTO rooms (id,floor,room_type,room_no,counter) VALUES(?,?,?,?,?)",[id,floor,room_type,room_no,counter])
    })
    .then(() =>{ 
        res.send('<script>alert("Room added Successfully");location.href="/reportGeneration"</script>');  
    })
    .catch(err=>{ 
        console.log(err);
    });
    
}

exports.getAddNewStudent=(req,res,next)=>{
    res.render('addNewStudent',{title:"Add New Student",path:'/addNewStudent'});
}

exports.postAddNewStudent=(req,res,next)=>{
    const user=req.body;
    console.log(user);
    const userDetail=[user.college,user.email,user.password];
    console.log(userDetail);
    db.execute("INSERT INTO student (college,email, password) VALUES(?,?,?)",userDetail)
    .then(() =>{ 
        res.send('<script>alert("Student added successfully!!");location.href="/addNewStudent"</script>');
    })
    .catch(err=>{ 
        console.log(err);
        res.send('<script>alert("The student with the same email already exists");location.href="/addNewStudent"</script>');
    });
    
}

exports.getDeleteStudent=(req,res,next)=>{
    res.render('deleteStudent',{title:"Delete Student",path:'/deleteStudent'})
}

exports.postDeleteStudent=(req,res,next)=>{
    const student=req.body;
    const email=student.email;
    console.log(student);
    let clg;
    db.execute("SELECT * from student_hostel inner join student on student.email=student_hostel.email where student.email=?",[email])
    .then(([rows,fieldData])=>{
        console.log(rows);
        clg=rows[0].college;
        console.log(clg);
        return db.execute("UPDATE rooms inner join college_hostel on rooms.id=college_hostel.key SET counter=counter+1 where college=? and rooms.room_no=? and hostel_no=? ",[rows[0].college,rows[0].room_no,rows[0].hostel])
    })
    .then(()=>{
        return db.execute("DELETE student_hostel, student from student inner join student_hostel where student.email= ? ",[email])
    })
    .then(()=>{
        res.send('<script>alert("Student Deleted Successfully");location.href="/deleteStudent"</script>');
    })
    .catch(err=>{ 
        console.log(err);
    });
}

exports.reportGeneration=(req,res,next)=>{
    db.execute("SELECT id,college,sum(counter)as total,hostel_no  FROM rooms inner join college_hostel on rooms.id=college_hostel.key WHERE counter>0 group by id")
    .then(([rows,fieldData])=>{
        console.log(rows);
        res.render('reportGeneration',{title:"Reports" ,reportData:rows, path:"/reportGeneration"});
    })
    .catch(err=>{ 
        console.log(err);
       
    });
}

