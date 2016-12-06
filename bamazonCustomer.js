var mysql = require("mysql");
var prompt = require("prompt");
var Table = require('cli-table');
var colors = require("colors/safe");

var connection = mysql.createConnection({
  host: "localhost",

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "Bamazon_db"
});
//create table variable
var table = new Table({
   head: ['ID', 'Product Name', 'Department', 'Price', 'Qty.']
   , colWidths: [5, 25, 15, 10, 10]
   });
//read from database
connection.query("SELECT * FROM products", function(err, response) {
    if (err) throw err;
    //push data to table
    for(var i =0; i<response.length; i++){
        table.push([response[i].item_id, response[i].product_name, response[i].department_name, response[i].price, response[i].stock_quantity]);
    }
    //print table
    console.log(table.toString());
    //run search function
    runSearch(response);
}); 

//set up search function
var runSearch = function(items) {

  prompt.message = colors.rainbow("Question!");
  prompt.delimiter = colors.green("><");
 
  prompt.start();
 
  prompt.get({
    properties: {
      name: {
        description: colors.magenta("What is the ID of the product you would like to buy?")
      }
  	}
}, function(err, answer) {
	//console.log(answer);
	//call function for quantity of units
     howMany(answer.name, items); 
    });
};
//function for quantity of units
var howMany = function(id, items) {
	//prompt for second message
	prompt.message = colors.rainbow("Question!");
	prompt.delimiter = colors.green("><");
	//console.log("here inside howMany");

	prompt.start();
	prompt.get({
		properties: {
			name: {
				description: colors.magenta("How many units of ID #" + id + " do you want?"),
			type: "integer",
			message: "Response must be a number"
			}
		}
	}, function(err, answer){
		//console.log(answer.name);
		//console.log(items[parseInt(id)-1].stock_quantity);
		var quantity = items[parseInt(id)-1].stock_quantity;
		var price = items[parseInt(id)-1].price;
		
		if(answer.name <= quantity){
				console.log("This will cost you $" +(answer.name*price).toFixed(2));
				//subtract answer from stock_quantity
				var newQuantity = quantity - answer.name;
				connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [ newQuantity, id ], function(err){
					if(err) throw err;
					//prompt for continue shopping
					prompt.message = colors.rainbow("Yes or No: ");
					prompt.delimiter = colors.green("><");

					prompt.start();
					prompt.get({
						properties: {
							name: {
								description: colors.magenta("Do you wish to continue shopping?"),
							}
						}
					}, function(err, answer){
						if(answer.name == "Yes"){
							//continue shopping
							runSearch();
						} else if(answer.name == "No"){
							//end connection
							connection.end();
						} else {
							console.log("Your answer must be 'Yes' or 'No'");
						}
					});
				});
		} else {
				console.log("Insufficient quantity in stock!")

				//return to howMany
				howMany();
		}
		});
	  };