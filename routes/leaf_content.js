


exports.leaf_content_get = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));

    req.getConnection(function (err, connection) {
        
        var data = {
            
            state    : input.state
        
        };
        
        var query_exist = connection.query("SELECT * FROM leaf_content where  session_id=? and leaf_id=? ", [input.session_id,  input.leaf_id], function(err, existing_rows){

          if(err)
            console.log(err);

          if(existing_rows.length)

            res.send(JSON.stringify(existing_rows));
          else
            res.send("nothing found");

        });
    
    });
};


exports.save = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    console.log(input);
    req.getConnection(function (err, connection) {
        
        var query_exist = connection.query("SELECT * FROM leaf_content where  session_id=? and leaf_id=? ", [input.session_id,  input.leaf_id], async function(err, existing_rows){

          if(err)
            console.log(err);

          if(existing_rows.length)
            {
              console.log('update');
              for(i=0; i<input.title.length; i++){

                var data1 = {
                  value: input.value[i]
                }
                let promise_update = new Promise((resolve, reject) => {
                  var query_update = connection.query("UPDATE leaf_content set ? WHERE id = ? ", [data1, existing_rows[i].id],function(err, rows){
                    if(err)
                      console.log(err);
                    resolve('done');
                  })
                })
                let y = await promise_update;
              }
              res.send('update success');
            }
          else
            {
              console.log('create');
              console.log(input.title.length);
              for(i=0; i<input.title.length; i++){

                var data = {
                  customer_id: input.customer_id,
                  leaf_id: input.leaf_id,
                  session_id: input.session_id,
                  title: input.title[i],
                  value: input.value[i]
                }
                let promise_create = new Promise((resolve, reject) => {
                  var query_create = connection.query("INSERT INTO leaf_content set ? ", data, function(err, rows){
                    if(err)
                      console.log(err);
                    resolve('done');
                  })
                })
                let x = await promise_create;
              }

                res.send('create success');
              
            }
        });
    
    });
};