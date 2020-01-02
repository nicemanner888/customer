


exports.state_save = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));

    req.getConnection(function (err, connection) {
        
        var data = {
            
            state    : input.state
        
        };
        
        connection.query("UPDATE leaf set ? WHERE id = ? ",[data,input.id], function(err, rows)
        {
  
          if (err)
              console.log("Error Updating : %s ",err );
         
          res.send(JSON.stringify('success'));
          
        });
    
    });
};