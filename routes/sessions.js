
/*
 * GET users listing.
 */




/*Save the customer*/
exports.save = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    
    req.getConnection(function (err, connection) {
        var data = {
            
            customer_id    : input.customer_id,
            date : input.date,
            type : input.type,
        
        };
       console.log('save request...', data);
        var query_exist = connection.query("SELECT * FROM session where customer_id=? and  type=? and date=?", [data.customer_id,  data.type, data.date], function(err, existing_rows){

            if(err)
              console.log("Error : %s", err);

            if(existing_rows.length){
              res.send("already exists");
            }
            else{
              var query = connection.query("INSERT INTO session set ? ",data, async function(err, rows)
                {
          
                  if (err)
                      console.log("Error inserting : %s ",err );

                  let promise_tree = new Promise((resolve, reject) => {
                      var query_tree_nodes = connection.query('SELECT * FROM tree_nodes where area=? and not path=?',[data.type, 'no-leaf'], async function(err,tree_node_rows){
                        if(err)
                          console.log("selecting tree_nodes_______"+err);
                          resolve(tree_node_rows);
                      });

                  });

                  let tree_node_rows = await promise_tree;

                  for(i=0;i<tree_node_rows.length;i++){

                      var create_leaf_data = {
                        tree_node_id:tree_node_rows[i].id,
                        session_id:rows.insertId,
                        customer_id:data.customer_id,
                      };

                      console.log(create_leaf_data);


                  let promise_leaf = new Promise((resolve, reject) => {
                        var query_leaf_create = connection.query('INSERT INTO leaf set ?', create_leaf_data, function(err, leaf_rows){
                          if(err)
                            console.log("creating leaf_____"+err);
                          resolve('done');
                        });

                      });
                  let x = await promise_leaf;

                    }

                  //res.redirect('/customers');
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(rows.insertId));
                  
                });
            }
            
        })
        
        
       // console.log(query.sql); get raw query
    
    });
};

exports.get_dates = function(req, res){

    var input = JSON.parse(JSON.stringify(req.body));
    console.log(input);
    req.getConnection(function (err, connection) {

      var query = connection.query("SELECT date, id FROM session where customer_id=? and type=? ", [input.customer_id, input.type], function(err, rows){
        if(err)
          console.log(err);
        var dates=[];
        var id=[];
        for(i=0;i<rows.length;i++){
          dates[i] = rows[i].date;
          id[i] = rows[i].id;
          console.log(id[i]);
        }
        res.send(JSON.stringify(rows));
      })
    })
}

exports.get = function(req,res){
    
    var input = JSON.parse(JSON.stringify(req.body));
    
    req.getConnection(function (err, connection) {

        console.log(input);
      
        var query_exist = connection.query("SELECT * FROM session where customer_id=? and  type=? ", [input.customer_id,  input.type], async function(err, session_rows){
            
            if(err)
              console.log(err);
            console.log(session_rows);
            if(session_rows.length){
              
              let promise_tree = new Promise((resolve, reject) => {
                var query_tree_nodes = connection.query("SELECT * FROM tree_nodes where area=?", input.type, async function(err, tree_rows){
                  if(err)
                    console.log(err);
                  resolve(tree_rows);
                });
              });
              var tree_rows = await promise_tree;
              var leaf_state = [];
              var leafs_state = [];
              for(i=0; i<session_rows.length; i++){
                let promise_leaf = new Promise((resolve, reject) => { 
                  var query_leaf = connection.query("SELECT tree_node_id, state FROM leaf where session_id=?", session_rows[i].id, function(err, leaf_rows){
                  if(err)
                    console.log(err);
                  leaf_state = [];
                  for(j=0; j<leaf_rows.length;j++)
                  {
                    leaf_state.push({node_id:leaf_rows[j].tree_node_id, state:leaf_rows[j].state}) ;
                  }
                  resolve(leaf_state);
                })
                });
                let x = await promise_leaf;
                leafs_state.push(x);
              }
              // console.log(tree_rows);
                k=0;
                var state_sub=[];
                var state=[];
              for(i=0; i<tree_rows.length; i++){
                  if(tree_rows[i].path!="no-leaf"){
                    for(j=0; j<session_rows.length; j++){
                    // console.log(leafs_state[j][i]);
                      // console.log(leafs_state[j][k]);
                      // console.log(k);
                      // console.log((i+1)+"            "+leafs_state[j][k].node_id);
                      state_sub.push(leafs_state[j][k].state);
                    }

                    k++;
                } 
                state.push(state_sub);
                state_sub=[];  
              }
              console.log(state);

              var results = tree_rows;
              var children = [];
              var source = [];
              for (i = 0; i < results.length; i++) {
                var item = results[i];
                var label = item["text"];
                var name = item["title"];
                var parentid = item["parent_id"];
                var id = item["id"];
                var path = item["path"];
                var state_tree = state[i];
                // console.log(state_tree);
                // console.log(leaf_id_tree);
                if (children[parentid]) {
                    var item = { name: name, label:label, path: path,  state:state_tree};

                    if (!children[parentid].children) {
                        children[parentid].children = [];
                    }

                    children[parentid].children[children[parentid].children.length] = item;
                    children[id] = item;

                }
                else {
                    children[id] = {name: name, label:label, path:path,  state:state_tree};
                    source[id] = children[id];
               }
           }


           
           items = [children[tree_rows[0].id]];


           let promise_customer = new Promise((resolve, reject) => {

          var query_customer = connection.query('SELECT * FROM customer where id=?', input.customer_id, function(err,customer_rows){
                   if(err)
                         console.log("Error Selecting:%s", err);
                       var customer_data = customer_rows;
                resolve(customer_data);
              });
          });
          let customer_data = await promise_customer;
          var dates=[];
          for (i=0; i<session_rows.length;i++){
            dates.push(session_rows[i].date);
          }

          return_json = {items:items, customer:customer_data[0], dates:dates};
                res.send(JSON.stringify(return_json));
            }
            else{
              res.send(JSON.stringify('no results'));
            }



        })
    })
  }

exports.delete_session = function(req,res){
          
     var id = req.params.id;
    
     req.getConnection(function (err, connection) {
        
        connection.query("DELETE FROM session  WHERE id = ? ",[id], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            
             // res.send(JSON.stringify('deleted'));
             
        });

        connection.query("DELETE FROM leaf  WHERE session_id = ? ",[id], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            
             // res.send(JSON.stringify('deleted'));
             
        });
        connection.query("DELETE FROM leaf_content  WHERE session_id = ? ",[id], function(err, rows)
        {
            
             if(err)
                 console.log("Error deleting : %s ",err );
            
             // res.send(JSON.stringify('deleted'));
             
        });
             res.send(JSON.stringify('deleted'));
        
        
     });
};


