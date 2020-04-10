var mongoose=require("mongoose"),
    Campground=require("./models/campground"),
    Comment=require("./models/comment");
    User=require("./models/user");
    seeds=[
        {
            name: "Pir Chinasi",
            image: "https://www.zameen.com/blog/wp-content/uploads/2020/02/Camping-Sites-in-Pakistan-J-26-02-1024x640.jpg",
            description: "Pir Chinasi is a hill station located nearly 30 kilometres from Muzaffarabad, the capital of Azad Jammu and Kashmir (AJK). The camping spot is situated at an elevation of 9,500 feet (2,895 metres) above sea level. The hilltop is a fascinating example of the beauty that AJK is rightfully famous for. The lush green plains of the hillside allow you to look over Muzaffarabad city. Talk about amazing views!"
        },
        {
            name: "Ratti Gali Lake",
            image: "https://www.zameen.com/blog/wp-content/uploads/2020/02/Body-I-26-02-1024x640.jpg",
            description: "An alpine glacial lake in the Karakoram Mountain Range and one of the most beautiful lakes of Pakistan, Ratti Gali Lake lies at an altitude of 12,000 feet (3,700 metres). It is around 100 kilometres from Muzaffarabad."
        },
        {
            name: "Saif-ul-Maluk Lake",
            image: "https://www.zameen.com/blog/wp-content/uploads/2020/02/Camping-Sites-in-Pakistan-C-26-02-1024x640.jpg",
            description: "About 10 kilometres from Naran, Saif-ul-Maluk Lake is one of the most scenic lakes in Pakistan with its backdrop of snow-topped mountains. At an elevation of 10,600 feet (3,200 metres), this lake is visited by thousands of tourists every year with plenty of boating and picnic opportunities."
        }
    ];
function seedDB(){
    //  CLEAR DB
    Campground.remove({}, function(err){
        Comment.remove({}, function(err){
            User.remove({}, function(err){
            });
        })
        
    });
}

module.exports=seedDB;