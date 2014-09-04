var http = require('http'),
    express = require('express'),
    ejs  = require('ejs'),
    mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs');
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

mongoose.connect('mongodb://localhost/atu_ios_db');

var Schema = mongoose.Schema;

//SchoolClass Model
var SchoolClass = new Schema({
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
	invitation_code:{type:String,required:true},
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
	due_date:{type:Date, required:true},
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
	assess_penalty:{type:Boolean, default:true}, //can be made false if valid reason is given
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
});

app.post('/api/class', function(req, res){
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

app.post('/api/student', function(req, res){
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

app.post('/api/assignment', function(req, res){
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
