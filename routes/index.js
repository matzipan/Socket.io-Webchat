
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', {  })
};
exports.main = function(req,res) {
	res.render("main" , { title: "Chat"});
}