
/*
 * GET users listing.
 */




/*Save the customers*/
exports.list = function(req, res){

  var input = JSON.parse(JSON.stringify(req.body));
  console.log(input);

  req.getConnection(function(err,connection){
       
        var query = connection.query('SELECT * FROM tree_nodes where area=?',input.type, async function(err,rows)
        {
            
            if(err)
                console.log("Error Selecting : %s ",err );
            
            var state_array=[];
            var leaf_id_array=[];
            for(i=0; i<rows.length;i++){

              let promise_state = new Promise((resolve, reject) => {

                var query_state = connection.query('SELECT id, state FROM leaf where tree_node_id=? and customer_id=? and session_id=?', [rows[i].id, input.customer_id, input.session_id], function(err, leaf_rows){
                    if(err)
                      console.log("Error Selecting:%s", err);
                    
                    if(leaf_rows.length){
                      state=leaf_rows[0].state;
                      leaf_id=leaf_rows[0].id;
                      // console.log(leaf_id);
                    }
                    else
                    {
                        state="blue";
                        leaf_id="";
                    }
                    var data={state:state, leaf_id:leaf_id};
                    resolve(data);
                })
              });
              let data = await promise_state;
              state_array.push(data.state);
              leaf_id_array.push(data.leaf_id);     
            }

              var results = rows;
              var source = [];
              var children = [];
        // build hierarchical source.
            for (i = 0; i < results.length; i++) {
                var item = results[i];
                var label = item["text"];
                var name = item["title"];
                var parentid = item["parent_id"];
                var id = item["id"];
                var path = item["path"]+'/'+leaf_id_array[i];
                var state_tree = state_array[i];
                var leaf_id_tree = leaf_id_array[i];
                // console.log(state_tree);
                // console.log(leaf_id_tree);
                if (children[parentid]) {
                    var item = { name: name, label:label, path: path, leaf_id:leaf_id_tree, state:state_tree};

                    if (!children[parentid].children) {
                        children[parentid].children = [];
                    }

                    children[parentid].children[children[parentid].children.length] = item;
                    children[id] = item;

                }
                else {
                    children[id] = {name: name, label:label, path:path, leaf_id:leaf_id_tree, state:state_tree};
                    source[id] = children[id];
               }
           }
           // res.json(children);
           // console.log(children[1]);

           items = [children[1]];


          let promise_customer = new Promise((resolve, reject) => {

              var query_customer = connection.query('SELECT * FROM customer where id=?', input.customer_id, function(err,customer_rows){
                   if(err)
                         console.log("Error Selecting:%s", err);
                       var customer_data = customer_rows;
                resolve(customer_data);
              });
          });
          let customer_data = await promise_customer;

          let promise_session = new Promise((resolve, reject) => {

              var query_customer = connection.query('SELECT * FROM session where id=?', input.session_id, function(err,session_rows){
                   if(err)
                         console.log("Error Selecting:%s", err);
                       var session_data = session_rows;
                resolve(session_data);
              });
          });
          let session_data = await promise_session;




          return_json = {items:items, customer:customer_data[0], session:session_data[0]};
          res.send(JSON.stringify(return_json));
           
         });
         
         //console.log(query.sql);
    });
  
};




