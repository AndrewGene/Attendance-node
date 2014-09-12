var http = require('http'),
    express = require('express'),
    ejs  = require('ejs'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    uuid = require('node-uuid'),
    bcrypt = require('bcrypt');
var app = express();
app.configure(function() {
    app.use(express.bodyParser({
	uploadDir: __dirname + '/tmp',
	keepExtensions:true}));
    app.use(express.limit('100mb'));
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(app.router);
    //app.use('/tmp',express.static(path.join(__dirname, '/tmp')));
    //app.use(express.static(__dirname + '/public'));
});
app.set('view engine', 'ejs');
app.set('view options', {
    layout: false
});

mongoose.connect('mongodb://localhost/atu_db');

var Schema = mongoose.Schema;

//SchoolClass Model
var SchoolClass = new Schema({
	id:{type:String, required:true},
	name:{type:String, required:true},
	class_number:String,
	students:[Schema.Types.Mixed],
	image:String,
	start_date:Date,
	end_date:Date,
	dates:[Date], // the real dates of class
	times_of_week:[Schema.Types.Mixed], //{day:Tuesday, start_hour:18, start_minute:00, end_hour:19, end_minute:00}
	grade_ratios:[Schema.Types.Mixed], //{homework:30,tests:30,final:40} (percentages)
	syllabus:String, //url
	grade_ranges:[Schema.Types.Mixed], //{a:{high:100, low:90}...
	attendance_penalty:[Schema.Types.Mixed], //{missed:3, penalty:10%} (dropped a "letter-grade") {late:5, penalty:5%}
	added_date:{type:Date, default:Date.now}
});

var SchoolClassModel = mongoose.model('SchoolClass', SchoolClass);

//Student Model
var Student = new Schema({
	id:{type:String, required:true},
	first_name:{type:String, required:true},
	last_name:{type:String, required:true},
	preferred_name:String,
	email:String,
	password:String,
	invitation_code:String,
	classes:[Schema.Types.Mixed],
	profile_picture:String,
	added_date:{type:Date, default:Date.now}
});

var StudentModel = mongoose.model('Student', Student);

//Instructor Model
var Instructor = new Schema({
	id:{type:String, required:true},
	first_name:{type:String, required:true},
	last_name:{type:String, required:true},
	preferred_name:String,
	email:{type:String, required:true},
	password:{type:String, required:true},
	classes:[Schema.Types.Mixed],
	profile_picture:String,
	added_date:{type:Date, default:Date.now}
});

var InstructorModel = mongoose.model('Instructor', Instructor);

//Attendance Model
var Attendance = new Schema({
	id:{type:String, required:true},
	class_id:{type:String, required:true},
	class_date:{type:Date, required:true},
	student_id:{type:String, required:true},
	present:{type:Boolean, required:true},
	late:Boolean,
	reason:String,
	added_date:{type:Date, default:Date.now}
});

var AttendanceModel = mongoose.model('Attendance', Attendance);

//Assignment Model
var Assignment = new Schema({
	id:{type:String, required:true},
	class_id:{type:String, required:true},
	type:{type:String, required:true}, //quiz, homework, test, final
	name:{type:String, required:true},
	description:String,
	instructor_notes:String,
	due_date:Date,
	max_points:Number,
	url:String, //in case a document is uploaded somewhere
	added_date:{type:Date, default:Date.now}
});

var AssignmentModel = mongoose.model('Assignment', Assignment);

//Grade Model
var Grade = new Schema({
	id:{type:String, required:true},
	assignment_id:{type:String, required:true},
	student_id:{type:String, required:true},
	points:Number,
	completed_date:Date,
	assess_penalty:{type:Boolean, default:false}, //can be made true if valid reason is given (it's late/incomplete)
	penalty_forgiveness_reason:String,		
	student_notes:String,
	instructor_notes:String,
	url:String, //in case they upload it
	added_date:{type:Date, default:Date.now}
});

var GradeModel = mongoose.model('Grade', Grade);

/*Notes*/
/*I might come up with a "penalty engine" for each assignment type (e.g. 10% deduction for each day late)
 * I might come up with a way to clone a class for the next year/semester
/*******/

app.get('/', function(req, res) {
	res.render('home',{title:"Introduction to iOS Programming"});
});

app.get('/api/student_list', function(req,res){
	res.json({'success':true,'students':['Cody Bailey','Brianne Campbell','Ben Drennan','Ryan Foley','Joseph Hull','Corey Mellon','Hayden Poff','Jacob Poirrier','Patrick Snell']});
});

app.post('/api/instructor/login',function(req,res){
	if(req.body.email !== undefined && req.body.password !== undefined){
		console.log('email',req.body.email);
		console.log('email - uppered', req.body.email.toUpperCase());
		console.log('pass',req.body.password);
		InstructorModel.findOne({'email':req.body.email.toUpperCase()},function(err,instructor){
			console.log(instructor);
			if(!err){
				if(instructor !== undefined && instructor !== null){
					if(bcrypt.compareSync(req.body.password,instructor.password)){
						instructor = instructor.toObject();
						instructor.password = undefined;
						res.json({'instructor':instructor,'success':true});
					}
					else{
						res.json({'success':false,'error':'Instructor not found'});
					}
				}
				else{
					res.json({'success':false,'error':'Instructor not found'});
				}
			}
			else{
				res.json({'success':false,'error':err});
			}
		});
	}
	else{
		res.json({'success':false,'error':'missing parameters'});
	}
});

app.post('/api/student/login',function(req,res){
	if(req.body.email !== undefined && req.body.password !== undefined){
		console.log('email',req.body.email);
		console.log('email - uppered', req.body.email.toUpperCase());
		console.log('pass',req.body.password);
		StudentModel.findOne({'email':req.body.email.toUpperCase()},function(err,student){
			console.log(student);
			if(!err){
				if(student !== undefined && student !== null){
					if(bcrypt.compareSync(req.body.password,student.password)){
						student = student.toObject();
						student.password = undefined;
						res.json({'student':student,'success':true});
					}
					else{
						res.json({'success':false,'error':'Student not found'});
					}
				}
				else{
					res.json({'success':false,'error':'Student not found'});
				}
			}
			else{
				res.json({'success':false,'error':err});
			}
		});
	}
	else{
		res.json({'success':false,'error':'missing parameters'});
	}
});

app.post('/api/instructor', function(req, res){
/*
 *
	id:{type:String, required:true},
	first_name:{type:String, required:true},
	last_name:{type:String, required:true},
	preferred_name:String,
	email:{type:String, required:true},
	password:{type:String, required:true},
	classes:[Schema.Types.Mixed],
	profile_picture:String,
	added_date:{type:Date, default:Date.now}
 */
	if(req.body.first_name !== undefined && req.body.last_name !== undefined && req.body.email !== undefined && req.body.password !== undefined){
		var instructor = {
			first_name:req.body.first_name,
			last_name:req.body.last_name,
			email:req.body.email.toUpperCase(),
			password: bcrypt.hashSync(req.body.password, 10)
		}

		if(req.body.preferred_name !== undefined){
			instructor = req.body.preferred_name;
		}
		
		var newInstructor = new InstructorModel(instructor);
		newInsructor.save(function(instructorError,theInstructor){
			if(!instructorError){
				if(theInstructor !== undefined && theInstructor !== null){
					res.json({'success':true});
				}
				else{
					res.json({'success':false,'error':'Instructor record could not be created'});
				}
			}
			else{
				res.json({'success':false,'error':instructorError});
			}
		});

	}
	else{
		res.json({'success':false, 'error':'first_name, last_name, email, and password are all required'});
	}
});

app.post('/api/class', function(req, res){
/*
 *
	id:{type:String, required:true},
	name:{type:String, required:true},
	number:String,
	students:[Schema.Types.Mixed],
	image:String,
	dates:[Date], // the real dates of class
	times_of_week:[Schema.Types.Mixed], //{day:Tuesday, start_hour:18, start_minute:00, end_hour:19, end_minute:00}
	grade_ratios:[Schema.Types.Mixed], //{homework:30,tests:30,final:40} (percentages)
	syllabus:String, //url
	grade_ranges:[Schema.Types.Mixed], //{a:{high:100, low:90}...
	attendance_penalty:[Schema.Types.Mixed], //{missed:3, penalty:10%} (dropped a "letter-grade") {late:5, penalty:5%}
	added_date:{type:Date, default:Date.now}
 */
	if(req.body.name !== undefined){
		var school_class = {
			name: req.body.name,
			id: uuid.v4().toUpperCase()
		}		

		if(req.body.class_number !== undefined){
			school_class.class_number = req.body.class_number;
		}

		if(req.body.start_date !== undefined){
			school_class.start_date = req.body.start_date;
		}

		if(req.body.end_date !== undefined){
			school_class.end_date = req.body.end_date;
		}

		if(req.body.start_date !== undefined && req.body.end_date !== undefined){
			//calculate school_class.dates field
		}

		if(req.body.times_of_week !== undefined){
			school_class.times_of_week = req.body.times_of_week;
		}

		if(req.body.grade_ratios !== undefined){
			school_class.grade_ratios = req.body.grade_ratios;
		}

		if(req.body.syllabus !== undefined){
			school_class.syllabus = req.body.syllabus;
		}

		if(req.body.grade_ranges !== undefined){
			school_class.grade_ranges = req.body.grade_ranges;
		}

		if(req.body.attendance_penalty !== undefined){
			school_class.attendance_penalty = req.body.attendance_penalty;
		}
		
		var newClass = new SchoolClassModel(school_classs);
		newClass.save(function(classError,theClass){
			if(!classError){
				if(theClass !== undefined && theClass !== null){
					res.json({'success':true});
				}
				else{
					res.json({'success':false,'error':'Class could not be created'});
				}
			}
			else{
				res.json({'success':false,'error':classError});
			}
		});
	}
	else{
		res.json({'success':false, 'error':'name is required'});
	}
});

app.post('/api/student', function(req, res){
/*
 *
	id:{type:String, required:true},
	first_name:{type:String, required:true},
	last_name:{type:String, required:true},
	preferred_name:String,
	email:String,
	password:String,
	invitation_code:String,
	classes:[Schema.Types.Mixed],
	profile_picture:String,
	added_date:{type:Date, default:Date.now}
 */
	if(req.body.first_name !== undefined && req.body.last_name !== undefined){
		var student = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			id: uuid.v4().toUpperCase()
		}	

		if(req.body.preferred_name !== undefined){
			student.preferred_name = req.body.preferred_name;
		}

		if(req.body.email !== undefined){
			student.email = req.body.email.toUpperCase();
		}

		if(req.body.password !== undefined){
			student.password = bcrypt.hashSync(req.body.password, 10);
		}
		
		var newStudent = new StudentModel(student);
		newStudent.save(function(studentError,theStudent){
			if(!studentError){
				if(theStudent !== undefined && theStudent !== null){
					res.json({'success':true});
				}
				else{
					res.json({'success':false,'error':'Student record could not be created'});
				}
			}
			else{
				res.json({'success':false,'error':studentError});
			}
		});

	}
	else{
		res.json({'success':false, 'error':'first_name and last_name are both required'});
	}
});

app.post('/api/assignment', function(req, res){
/*
 *
	id:{type:String, required:true},
	class_id:{type:String, required:true},
	type:{type:String, required:true}, //quiz, homework, test, final
	name:{type:String, required:true},
	description:String,
	instructor_notes:String,
	due_date:Date,
	max_points:Number,
	url:String, //in case a document is uploaded somewhere
	added_date:{type:Date, default:Date.now}
 */
	if(req.body.class_id !== undefined && req.body.type !== undefined && req.body.name !== undefined){
		var assignment = {
			class_id: req.body.class_id,
			type: req.body.type,
			name: req.body.name,
			id: uuid.v4().toUpperCase()
		}	

		if(req.body.description !== undefined){
			assignment.description = req.body.description;
		}

		if(req.body.instructor_notes !== undefined){
			assignment.instructor_notes = req.body.instructor_notes;
		}

		if(req.body.due_date !== undefined){
			assignment.due_date = req.body.due_date;
		}

		if(req.body.max_points !== undefined){
			assignment.max_points = req.body.max_points;
		}

		if(req.body.url !== undefined){
			assignment.url = req.body.url;
		}
		
		var newAssigment = new AssignmentModel(assignment);
		newAssignment.save(function(assignmentError,theAssignment){
			if(!assignmentError){
				if(theAssignment !== undefined && theAssignment !== null){
					res.json({'success':true});
				}
				else{
					res.json({'success':false,'error':'Assignment could not be created'});
				}
			}
			else{
				res.json({'success':false,'error':assignmentError});
			}
		});
	}
	else{
		res.json({'success':false, 'error':'class_id, type, and name are all required'});
	}
});

app.post('/api/grade', function(req, res){
/*
 *
	id:{type:String, required:true},
	assignment_id:{type:String, required:true},
	student_id:{type:String, required:true},
	points:Number,
	completed_date:Date,
	assess_penalty:{type:Boolean, default:true}, //can be made false if valid reason is given
	penalty_forgiveness_reason:String,		
	student_notes:String,
	instructor_notes:String,
	url:String, //in case they upload it
	added_date:{type:Date, default:Date.now}
 */
	if(req.body.assignment_id !== undefined && req.body.student_id){
		var grade = {
			assignment_id: req.body.assignment_id,
			student_id: req.body.student_id,
			id:uuid.v4().toUpperCase()
		};

		//Optional fields go here
		if(req.body.points !== undefined){
			grade.points = req.body.points;
		}

		if(req.body.completed_date !== undefined){
			grade.completed_date = req.body.completed_date;
		}

		if(req.body.penalty_forgiveness_reason !== undefined){
			grade.penalty_forgiveness_reason = req.body.penalty_forgiveness_reason;
		}

		if(req.body.instructor_notes !== undefined){
			grade.instructor_notes = req.body.instructor_notes;
		}
		/////////////////////////

		var newGrade = new GradeModel(grade);
		newGrade.save(function(gradeError,theGrade){
			if(!gradeError){
				if(theGrade !== undefined && theGrade !== null){
					res.json({'success':true});
				}
				else{
					res.json({'success':false,'error':'Grade could not be created'});
				}
			}
			else{
				res.json({'success':false,'error':gradeError});
			}
		});
	}
	else{
		res.json({'success':false, 'error':'assignment_id and student_id are both  required'});
	}
});

app.put('/api/instructor/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
/*
 *
	id:{type:String, required:true},
	first_name:{type:String, required:true},
	last_name:{type:String, required:true},
	preferred_name:String,
	email:{type:String, required:true},
	password:{type:String, required:true},
	classes:[Schema.Types.Mixed],
	profile_picture:String,
	added_date:{type:Date, default:Date.now}
 */
});

app.put('/api/class/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
/*
 *
	id:{type:String, required:true},
	name:{type:String, required:true},
	class_number:{type:String, required:true},
	when:String,
	students:[Schema.Types.Mixed],
	image:String,
	class_dates:[Date], // the real dates of class
	class_times_of_week:[Schema.Types.Mixed], //{day:Tuesday, start_hour:18, start_minute:00, end_hour:19, end_minute:00}
	grade_ratios:[Schema.Types.Mixed], //{homework:30,tests:30,final:40} (percentages)
	syllabus:String, //url
	grade_ranges:[Schema.Types.Mixed], //{a:{high:100, low:90}...
	attendance_penalty:[Schema.Types.Mixed], //{missed:3, penalty:10%} (dropped a "letter-grade") {late:5, penalty:5%}
	added_date:{type:Date, default:Date.now}
 */
});

app.put('/api/student/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
/*
 *
	id:{type:String, required:true},
	first_name:{type:String, required:true},
	last_name:{type:String, required:true},
	preferred_name:String,
	email:String,
	password:String,
	invitation_code:{type:String,required:true},
	classes:[Schema.Types.Mixed],
	profile_picture:String,
	added_date:{type:Date, default:Date.now}
 */
});

app.put('/api/assignment/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
/*
 *
	id:{type:String, required:true},
	class_id:{type:String, required:true},
	type:{type:String, required:true}, //quiz, homework, test, final
	name:{type:String, required:true},
	description:String,
	instructor_notes:String,
	due_date:{type:Date, required:true},
	max_points:Number,
	url:String, //in case a document is uploaded somewhere
	added_date:{type:Date, default:Date.now}
 */
});

app.put('/api/grade/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
/*
 *
	id:{type:String, required:true},
	assignment_id:{type:String, required:true},
	student_id:{type:String, required:true},
	points:Number,
	completed_date:Date,
	assess_penalty:{type:Boolean, default:true}, //can be made false if valid reason is given
	penalty_forgiveness_reason:String,		
	student_notes:String,
	instructor_notes:String,
	url:String, //in case they upload it
	added_date:{type:Date, default:Date.now}
 */
});

app.delete('/api/instructor/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){

});

app.delete('/api/class/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){

});

app.delete('/api/student/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){

});

app.delete('/api/assignment/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){

});

app.delete('/api/grade/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){

});

app.get('/api/instructor/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
	//return info and classes
	//who can make this call other than the instructor?
});

app.get('/api/class/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
	//return info, students, and assignments
	//only instructor gets back everything
	//students get back info and assignments (what about other student's info???)
	//everyone else can only get back info
});

app.get('/api/student/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
	//return info, attendance, and grades
	//only instructor and that student gets back everything
});

app.get('/api/assignment/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
	//return info and student/grades along with max/avg grades and who missed
	//instructor and students get back info
	//instructor gets back info and students/grades
});

app.get('/api/grade/:id([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})', function(req, res){
	//retrun info and student
});

app.listen(9000);
console.log('Server running at http://127.0.0.1:9000/');
