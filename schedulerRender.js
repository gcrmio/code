const {Pool, Client} = require('pg');

const pool = new Pool({
  host: process.env.PG_host,
  user: process.env.PG_user,
  password: process.env.PG_password,
  database: process.env.PG_database,
  port: process.env.PG_port,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports.viewStatus = function(req, res){
    
    var table = '';
    let query = 'SELECT * FROM scheduler';
    var reo = '<html><head><title>MMS Program Status List</title></head><body>{${table}}</body></html>';

    pool.query(query, (err, result) => {
        if(err){
            console.log('query error: ' + err);
            res.status(404);
        }
        for(var i = 0; i < result.length; i++){
            table += '<tr><td>'+(i+1)+'</td><td>'+result[i].app_name+'</td><td>'+res[i].status+'</td><td>'+res[i].last_run_date+'</td><tr>';
        }
        table = '<table border = "1"><tr><th>#</th><th>App Name</th><th>Status</th><th>Last Run Date</th></tr>'+table+'</table>';
        //console.log(result);
        return res(table); 
    })
    res.status(200);
}