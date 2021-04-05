


document.addEventListener('DOMContentLoaded', function() {

  // window.onpopstate = function(event) {
  //   console.log(event.state.view)
  //   build_barrels(event.state.view)
  // }

  // document.querySelectorAll('button').forEach(button => {
  //   button.onclick = function() {
  //     const view = this.dataset.view;
  //     history.pushState({view: view}, "", `${view}`);
    // };
  // });
    document.querySelector('#homepage').addEventListener('click', () => build_barrels('home'));
    document.querySelector('#archived').addEventListener('click', () => build_barrels('archived'));
    document.querySelector('#account').addEventListener('click', () => load_account());
    document.querySelector('#alerts').addEventListener('click', () => load_alerts());
    document.querySelector('#add_barrel').addEventListener('click', () => add_barrel());
    document.querySelector('#submit-barrel-button').addEventListener('click', () => submit_barrel())
   

    fetch(`/load_alerts`)
      .then(response => response.json())
      .then(alerts => {
        var counter = 0;
        for(var i = 0; i < alerts.length; i++){
          if(alerts[i].alert_read === false){
            counter++;
          }
        }
        if(counter > 0){
          document.getElementById("alerts").style.backgroundColor= "red"
        } 
        // else{
        //   document.getElementById("alerts").style.backgroundColor= "whitesmoke"
        // }
      }) 
    
    build_barrels('home')
  });

//filter barrels 
function filter_barrels(){
  //based on beer styles
  const filter_params = document.querySelector('#beer_style').value;
  const filter_parms2 = document.querySelector('#archived_unarchived_filter').value;
  const filter_params3 = document.querySelector('#barrel_type').value;

  document.querySelector('#barrels-view').style.display = 'block'; 
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#edit-account-view').style.display = 'none';
  document.querySelector('#add-note-view').style.display = 'none';
  document.querySelector('#alerts-view').style.display = 'none';
  document.querySelector('#edit-barrel-view').style.display = 'none';

  document.querySelector('#barrels-view').innerHTML = `<h3>Filtered Results: ${filter_params}</h3>`;
  var counter = 0;
  const line_break = document.createElement('br');
  
  fetch(`/filter/${filter_params}/${filter_parms2}/${filter_params3}`)
    .then(response => response.json())
    .then(barrels => {
      console.log(barrels)
      //buils barrels, creating elements, assigning innerHTML, and append to DOM tree
      barrels.forEach(barrels => {
      counter++
      const barrel_title = document.createElement('h3');
      const barrel_fill_date = document.createElement('div');
      const barrel_pull_date = document.createElement('div');
        
      const barrel_id = barrels.id
      barrel_title.innerHTML = barrels.title;
      barrel_title.addEventListener('click', function() {
        const view = this.dataset.view;
          history.pushState({view: view}, "", `${barrels.title}`);
          single_barrel_load(barrel_id)
        })
      barrel_fill_date.innerHTML = "Barrel Fill Date:  " + barrels.fill_date;
      barrel_pull_date.innerHTML = "Estimated Pull Date:  " + barrels.pull_date;
    
      document.querySelector('#barrels-view').append(barrel_title);
      document.querySelector('#barrels-view').append(barrel_fill_date);
      document.querySelector('#barrels-view').append(barrel_pull_date);

      });
      document.querySelector('#barrels-view').append(line_break)
      document.querySelector('#barrels-view').append('Barrel Count: ' + counter);
  })
  //catch error 
  .catch(error => {
    console.log('error:', error )
    const no_barrel_error = document.createElement('h3');
    no_barrel_error.innerHTML = 'No Results Found'
    document.querySelector('#barrels-view').append(no_barrel_error)
    });
}

function add_barrel(){

  document.querySelector('#edit-barrel-view').style.display = 'block';
  document.querySelector('#submit-barrel-button').style.display= 'block';
  document.querySelector('#submit-barrel-header').style.display = 'block';
  document.querySelector('#edit-barrel-header').style.display = 'none';
  document.querySelector('#save-changes-button').style.display = 'none';
  document.querySelector('#edit-account-view').style.display = 'none';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#barrels-view').style.display = 'none'; 
  document.querySelector('#filter-view').style.display = 'none';
  document.querySelector('#add-note-view').style.display = 'none';
  document.querySelector('#alerts-view').style.display = 'none';

  document.querySelector('#barrel-back-button').addEventListener('click', () => build_barrels('home'));

  fetch(`/load_account`)
    .then(response => response.json())
    .then(account => {
      const barrel_count_total = account.barrel_count + 1;
      document.querySelector('#edit-barrel-title').value = "Barrel " + barrel_count_total;
    });

  document.querySelector('#edit-barrel-title').value = '';
  document.querySelector('#edit-barrel-estimated-ABV').value = '';
  document.querySelector('#edit-beer-style').value = '';
  document.querySelector('#edit-barrel-type').value = '';
  document.querySelector('#edit-barrel-fill-date').value = '';
  document.querySelector('#edit-barrel-pull-date').value= '';
  document.querySelector('#edit-barrel-description').value='';

};

function submit_barrel(){
  document.querySelector('#edit-barrel-view').style.display = 'block';
  document.querySelector('#submit-barrel-button').style.display= 'block';
  document.querySelector('#save-changes-button').style.display = 'none';
  document.querySelector('#edit-account-view').style.display = 'none';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#barrels-view').style.display = 'none'; 
  document.querySelector('#filter-view').style.display = 'none';
  document.querySelector('#add-note-view').style.display = 'none';
  document.querySelector('#alerts-view').style.display = 'none';

  const title = document.querySelector('#edit-barrel-title').value;
  const estimated_ABV = document.querySelector('#edit-barrel-estimated-ABV').value;
  const beer_style = document.querySelector('#edit-beer-style').value;
  const barrel_category = document.querySelector('#edit-barrel-type').value;
  const fill_date = document.querySelector('#edit-barrel-fill-date').value;
  const pull_date = document.querySelector('#edit-barrel-pull-date').value;
  const description = document.querySelector('#edit-barrel-description').value;

  fetch(`/submit_barrel`, {
    method: 'POST',
    body: JSON.stringify({
      title: title,
      estimated_ABV: estimated_ABV,
      beer_style: beer_style,
      barrel_category: barrel_category,
      fill_date: fill_date,
      pull_date: pull_date,
      description: description
    })
  })  
  // .then( () => {
  //   alert("You've added a barrel to the database.")
  // })

  .then( () => {
    build_barrels('home');
  })
}

//loads user account data
function load_account(){

  //clears the DOM before fetching data. This is dumb. I just need to store it in cache. 
  const parent = document.getElementById("account-view")
    while (parent.firstChild) {
     parent.firstChild.remove()
    }

  document.querySelector('#barrels-view').style.display = 'none'; 
  document.querySelector('#account-view').style.display = 'block';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#filter-view').style.display = 'none';
  document.querySelector('#edit-account-view').style.display = 'none';
  document.querySelector('#add-note-view').style.display = 'none';
  document.querySelector('#alerts-view').style.display = 'none';
  document.querySelector('#edit-barrel-view').style.display = 'none';

  fetch('/load_account')
    .then(response => response.json())
    .then(account => {
      //create elements, adjust innerHTML, and append to DOM tree. 
      
      console.log(account)
      const account_header = document.createElement('h1')
      const account_owner_email = document.createElement('div')
      const account_owner_date_joined = document.createElement('div')
      const account_owner_barrel_count = document.createElement('div')
      const account_bookmarked_barrel_button = document.createElement('button')
      const account_edit_button = document.createElement('button')
      // const barrel_count_bookmarked = bookmarked_barrel_counter()
      // console.log(bookmarked_barrel_counter())

      var counter = 0;
      fetch(`/build_barrels/bookmarked`) 
    .then(response => response.json())
    .then(barrels => {
      for(var i = 0; i < barrels.length; i++){
        counter++;
      }
      account_bookmarked_barrel_button.innerHTML = "Bookmarked Barrels: " + counter;
    })

      account_bookmarked_barrel_button.addEventListener('click', function() {
        build_barrels('bookmarked')
      })
      account_edit_button.innerHTML = "Edit Account";
      account_edit_button.addEventListener('click', function() {
        edit_account()
      })
      account_header.innerHTML = account.account_owner;
      account_owner_email.innerHTML = "Email:  " + account.email;
      account_owner_date_joined.innerHTML = "Date Joined:  " + account.date_joined;
      account_owner_barrel_count.innerHTML = "Barrels Added:  " + account.barrel_count;

      document.querySelector('#account-view').append(account_header);
      document.querySelector('#account-view').append(account_owner_email);
      document.querySelector('#account-view').append(account_owner_date_joined);
      document.querySelector('#account-view').append(account_owner_barrel_count);
      document.querySelector('#account-view').append(account_bookmarked_barrel_button);
      document.querySelector('#account-view').append(account_edit_button);
    });
}
//loads alerts for barrels needing to be pulled within 7 days
function load_alerts(){
  document.querySelector('#alerts-view').style.display = 'block';
  document.querySelector('#barrels-view').style.display = 'none'; 
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#filter-view').style.display = 'none';
  document.querySelector('#edit-account-view').style.display = 'none';
  document.querySelector('#add-note-view').style.display = 'none';
  document.querySelector('#edit-barrel-view').style.display = 'none';

  document.querySelector('#alerts-view').innerHTML = `<h3> Alerts </h3>`;

  fetch(`/load_alerts`)
    .then(response => response.json())
    .then(alerts => {
      console.log(alerts)

      alerts.forEach(alerts => {
      const alert_title = document.createElement('h6');
      const alert_message = document.createElement('div');
      const line_break = document.createElement('br');
      const remove_button = document.createElement('button');
      const line_break_mark = document.createElement('hr');
      

      //loads alerts with onclick function linking to barrel
      alert_title.innerHTML = `Alert for ${alerts.alert_barrel}` + `<br>` + `On: ${alerts.alert_timestamp}` + `<br>` + `${alerts.alert_message}`;
      alert_title.addEventListener('click', function() {
        single_barrel_load(alerts.alert_barrel_id)
      })
      const alert_id = alerts.id
      remove_button.innerHTML = "Remove";
      remove_button.addEventListener('click', function() {
        remove_alert(alert_id)
      })
      document.querySelector('#alerts-view').append(remove_button);
      document.querySelector('#alerts-view').append(alert_title);
      document.querySelector('#alerts-view').append(line_break);
      document.querySelector('#alerts-view').append(line_break_mark);
    })
    
  });
  document.getElementById("alerts").style.backgroundColor= "whitesmoke"
  fetch(`/read_alerts`, {
    method: 'PUT',
    body: JSON.stringify({
      alert_read: true
    })
  })
  .then( () => {
    console.log("done")
  });

};
//builds barrels based on build view
function build_barrels(build_view){

  document.querySelector('#barrels-view').style.display = 'block'; 
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#edit-barrel-view').style.display = 'none';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#filter-view').style.display = 'block';
  document.querySelector('#edit-account-view').style.display = 'none';
  document.querySelector('#add-note-view').style.display = 'none';
  document.querySelector('#alerts-view').style.display = 'none';

  document.querySelector('#barrels-view').innerHTML = `<h3>${build_view.charAt(0).toUpperCase() + build_view.slice(1)}</h3>`;

  //Hits the API, asking for the barrels by build view, receiving array of objects as response
  fetch(`/build_barrels/${build_view}`) 
    .then(response => response.json())
    .then(barrels => {
      console.log(barrels);

      //for each barrel, create elements, assign innerHTML, and append to DOM tree.
      barrels.forEach(barrels => {

        const barrel_title = document.createElement('h3');
        const barrel_fill_date = document.createElement('div');
        const barrel_pull_date = document.createElement('div');
        const line_break = document.createElement('hr');
        
        const barrel_id = barrels.id
        barrel_title.innerHTML = barrels.title;
        barrel_title.addEventListener('click', function() {
          const view = this.dataset.view;
          history.pushState({view: view}, "", `${barrels.title}`);
          single_barrel_load(barrel_id)
        })
        barrel_fill_date.innerHTML = "Barrel Fill Date:  " + barrels.fill_date;
        barrel_pull_date.innerHTML = "Estimated Pull Date:  " + barrels.pull_date;
    
        document.querySelector('#barrels-view').append(barrel_title);
        document.querySelector('#barrels-view').append(barrel_fill_date);
        document.querySelector('#barrels-view').append(barrel_pull_date);
        document.querySelector('#barrels-view').append(line_break);

    });
    
  })
  //catch error
  .catch(error => {
    console.log('error:', error )
    const no_barrel_error = document.createElement('h3');
    no_barrel_error.innerHTML = 'You have no barrels in this category'
    document.querySelector('#barrels-view').append(no_barrel_error)
    });
};


//Loads single barrel based on ID, rendering the details of the selected barrel
function single_barrel_load(id){
  document.querySelector('#single-barrel-view').style.display = 'block';
  document.querySelector('#add-note-view').style.display = 'block';
  document.querySelector('#edit-barrel-view').style.display = 'none';
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#barrels-view').style.display = 'none'; 
  document.querySelector('#filter-view').style.display = 'none';
  document.querySelector('#edit-account-view').style.display = 'none';
  document.querySelector('#alerts-view').style.display = 'none';

  //Hits the API, asking for the barrel by ID, receiving JSON as response
  fetch(`/single_barrel_load/${id}`)
    .then(response => response.json())
    .then(barrel => {
      console.log(barrel);

    //Build barrel
      document.querySelector('#single-barrel-view').innerHTML = `<h3>${barrel.title.charAt(0).toUpperCase() + barrel.title.slice(1)}</h3>`;
        
        const barrel_estimated_ABV = document.createElement('div');
        const barrel_beer_style = document.createElement('div');
        const barrel_category = document.createElement('div');
        const barrel_fill_date = document.createElement('div');
        const barrel_pull_date = document.createElement('div');
        const barrel_description = document.createElement('p');
        const barrel_archive_button = document.createElement('button');
        const barrel_unarchive_button = document.createElement('button');
        const barrel_delete_button = document.createElement('button');
        const barrel_bookmark_button = document.createElement('button');
        const barrel_unbookmark_button = document.createElement('button');
        const barrel_add_note_button = document.createElement('button');
        const barrel_stop_alerts_button = document.createElement('button');
        const barrel_start_alerts_button = document.createElement('button');
        const barrel_edit_button = document.createElement('button');

        barrel_estimated_ABV.innerHTML = "Estimated ABV:  " + barrel.estimated_ABV +"%";
        barrel_description.innerHTML = "Description:  " + barrel.description;
        barrel_beer_style.innerHTML = "Beer Style:  " + barrel.beer_style;
        barrel_category.innerHTML = "Barrel Type:  " + barrel.barrel_category;
        barrel_fill_date.innerHTML = "Barrel Fill Date:  " + barrel.fill_date;
        barrel_pull_date.innerHTML = "Estimated Pull Date:  " + barrel.pull_date;
        const barrel_id = barrel.id;

        //clear any content in note box
        document.querySelector('#add-note-content').value = '';

        //edit button
        barrel_edit_button.innerHTML = "Edit Barrel"
        barrel_edit_button.addEventListener('click', function() {
          edit_barrel(barrel_id)
        })

        //bookmark button
        const barrel_bookmarked = barrel.bookmarked;
        barrel_bookmark_button.innerHTML = "Bookmark Barrel"
        barrel_bookmark_button.addEventListener('click', function() {
          bookmark_barrel(barrel_id)
        })

        //unbookmark button
        barrel_unbookmark_button.innerHTML = "Unbookmark Barrel"
        barrel_unbookmark_button.addEventListener('click', function() {
          unbookmark_barrel(barrel_id)
        })

        //archive barrel button
        const barrel_archived = barrel.archived;
        barrel_archive_button.innerHTML = "Archive Barrel";
        barrel_archive_button.addEventListener('click', function() {
          archive_barrel(barrel_id)
        })
        //unarchive barrel button
        barrel_unarchive_button.innerHTML = "Unarchive Barrel";
        barrel_unarchive_button.addEventListener('click', function() {
          unarchive_barrel(barrel_id)
        })
        //delete barrel button
        barrel_delete_button.innerHTML = "Delete Barrel"
        barrel_delete_button.addEventListener('click', function() {
          delete_barrel(barrel_id)
        })

        //add note button
        barrel_add_note_button.innerHTML = "Add Note"
        barrel_add_note_button.addEventListener('click', function() {
          add_note(barrel_id)
        })

        //start alerts button
        const barrel_alerts = barrel.alert_off;
        barrel_start_alerts_button.innerHTML = "Turn On Alerts"
        barrel_start_alerts_button.addEventListener('click', function() {
          start_alerts(barrel_id)
        })

        //stop alerts button
        barrel_stop_alerts_button.innerHTML = "Turn Off Alerts"
        barrel_stop_alerts_button.addEventListener('click', function() {
          stop_alerts(barrel_id)
        })

        //append each element to the DOM
        document.querySelector('#single-barrel-view').append(barrel_estimated_ABV);
        document.querySelector('#single-barrel-view').append(barrel_beer_style);
        document.querySelector('#single-barrel-view').append(barrel_category);
        document.querySelector('#single-barrel-view').append(barrel_fill_date);
        document.querySelector('#single-barrel-view').append(barrel_pull_date);
        document.querySelector('#single-barrel-view').append(barrel_description);
        document.querySelector('#single-barrel-view').append(barrel_delete_button);
        document.querySelector('#single-barrel-view').append(barrel_add_note_button);
        document.querySelector('#single-barrel-view').append(barrel_edit_button);
        //conditions the will render the visibility of buttons based on state of the barrel
        if(barrel_archived === false){
        document.querySelector('#single-barrel-view').append(barrel_archive_button);
        }
        else{
          document.querySelector('#single-barrel-view').append(barrel_unarchive_button);
        }

        if(barrel_bookmarked === false){
          document.querySelector('#single-barrel-view').append(barrel_bookmark_button)
        }
        else{
          document.querySelector('#single-barrel-view').append(barrel_unbookmark_button);
        }

        if(barrel_alerts === false){
          console.log('test')
          document.querySelector('#single-barrel-view').append(barrel_stop_alerts_button)
        }
        else{
          document.querySelector('#single-barrel-view').append(barrel_start_alerts_button)
        }
        load_notes(barrel_id)
        })
  }

  function edit_barrel(id){

    document.querySelector('#edit-barrel-view').style.display = 'block';
    document.querySelector('#save-changes-button').style.display = 'block';
    document.querySelector('#submit-barrel-header').style.display = 'none';
    document.querySelector('#edit-barrel-header').style.display = 'block';
    document.querySelector('#submit-barrel-button').style.display= 'none';
    document.querySelector('#edit-account-view').style.display = 'none';
    document.querySelector('#single-barrel-view').style.display = 'none';
    document.querySelector('#account-view').style.display = 'none';
    document.querySelector('#barrels-view').style.display = 'none'; 
    document.querySelector('#filter-view').style.display = 'none';
    document.querySelector('#add-note-view').style.display = 'none';
    document.querySelector('#alerts-view').style.display = 'none';

    document.querySelector('#barrel-back-button').addEventListener('click', () => single_barrel_load(id));

    fetch(`/single_barrel_load/${id}`)
      .then(response => response.json())
      .then(barrel => {
        console.log(barrel);

        const barrel_id = barrel.id
        const title = barrel.title
        const beer_style = barrel.beer_style
        const barrel_category = barrel.barrel_category
        const estimated_ABV = parseInt(barrel.estimated_ABV)
        var fill_date = barrel.fill_date
        const pull_date = barrel.pull_date
        const description = barrel.description

        document.querySelector('#edit-barrel-title').value = title;
        document.querySelector('#edit-barrel-estimated-ABV').value = estimated_ABV;
        document.querySelector('#edit-beer-style').value = beer_style;
        document.querySelector('#edit-barrel-type').value = barrel_category;
        document.querySelector('#edit-barrel-fill-date').value = fill_date;
        document.querySelector('#edit-barrel-pull-date').value= pull_date;
        document.querySelector('#edit-barrel-description').value=description;

        document.querySelector('#save-changes-button').addEventListener('click', () => submit_changes_to_barrel(barrel_id))
      });
    
  }

  function submit_changes_to_barrel(id){

        const title = document.querySelector('#edit-barrel-title').value;
        const estimated_ABV = document.querySelector('#edit-barrel-estimated-ABV').value;
        const beer_style = document.querySelector('#edit-beer-style').value;
        const barrel_category = document.querySelector('#edit-barrel-type').value;
        const fill_date = document.querySelector('#edit-barrel-fill-date').value;
        const pull_date = document.querySelector('#edit-barrel-pull-date').value;
        const description = document.querySelector('#edit-barrel-description').value;

        fetch(`/submit_changes_to_barrel/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: title,
            estimated_ABV: estimated_ABV,
            beer_style: beer_style,
            barrel_category: barrel_category,
            fill_date: fill_date,
            pull_date: pull_date,
            description: description
          })
        })  
        .then( () => {
          alert("These changes have been made.")
        })
        .then ( () => {
          single_barrel_load(id)
        })
  }
  function load_notes(id){

        const barrel_note_header = document.createElement('h3')
        barrel_note_header.innerHTML = "Notes"
        document.querySelector('#single-barrel-view').append(barrel_note_header);

    fetch(`/load_notes/${id}`)
      .then(response => response.json())
      .then(notes => {
        console.log(notes)

        notes.forEach(notes => {
        
        const barrel_note_timestamp = document.createElement('div');
        const barrel_note_content = document.createElement('div');
        const line_break = document.createElement('br');
        const line_break_mark = document.createElement('hr');

        barrel_note_timestamp.innerHTML = notes.note_timestamp;
        barrel_note_content.innerHTML = notes.content;
        
        document.querySelector('#single-barrel-view').append(barrel_note_timestamp);
        document.querySelector('#single-barrel-view').append(barrel_note_content);
        document.querySelector('#single-barrel-view').append(line_break);
        document.querySelector('#single-barrel-view').append(line_break_mark);

        });
        
      });
  };


  function add_note(id){
    const content = document.querySelector("#add-note-content").value
    fetch(`/add_note/${id}`, {
      method: 'POST',
      body: JSON.stringify({
        content: content
      })
    })
    .then( () => {
      alert("Your note has been succesfully added")
    })
    .then( () => {
      single_barrel_load(id)
    })
     //catch error 
  .catch(error => {
  console.log('error:', error )
  alert("You must add content to the note")
  });
  }

  function edit_account(){
    document.querySelector('#edit-account-view').style.display = 'block';
    document.querySelector('#single-barrel-view').style.display = 'none';
    document.querySelector('#account-view').style.display = 'none';
    document.querySelector('#barrels-view').style.display = 'none'; 
    document.querySelector('#filter-view').style.display = 'none';
    document.querySelector('#add-note-view').style.display = 'none';
    document.querySelector('#alerts-view').style.display = 'none';

    document.querySelector('#account-back-button').addEventListener('click', () => load_account());
  
  };
  
 //Below are the PUT and DELETE operations hitting the API on the backend 
//function that hits API with new changes made to username and/or email
  function submit_changes_to_account() {
    const username = document.querySelector("#edit-account-username").value;
    const email = document.querySelector("#edit-account-email").value;

    console.log(username)
    console.log(email)
    

    fetch(`/edit_account/`, {
      method: 'PUT',
      body: JSON.stringify({
        username: username,
        email: email
      })
    })
    //alert stating that changes have been made
      .then( () => {
        alert("Your changes have been made")
      })
    //return back to Account
      .then( () => {
        load_account()
      })
     //alert error if there is an issue saving changes 
      .catch(error => {
        console.log(error, 'error')
        alert("There was an error making these changes")
      });
    };


//Archive barrel based on ID 
function archive_barrel(id){

  //change archived field in barrel model to true
  fetch(`/archive_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  //return back to Homepage
  .then( () => {
    build_barrels('home')
  });
}

//Unarchive barrel based on ID
function unarchive_barrel(id){

  //change archived field in barrel model to false
  fetch(`/unarchive_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  //return back to Homepage
  .then( () => {
    build_barrels('home')
  });
}

//Delete barrel based on ID
function delete_barrel(id){

  //confirm box asking if the user wants barrel to be deleted
  const delete_confirmation = confirm("Are you sure you want to delete this barrel ?");
  if( delete_confirmation === true ){
  
    fetch(`/delete_barrel/${id}`,{
    method: 'DELETE',
    })
    .then( () => {
      alert("This barrel has been deleted")
    })
    //return back to Homepage
    .then( () => {
      build_barrels('home')
    })
  }
};

//Bookmarks barrel based on ID
function bookmark_barrel(id){

  //change bookmarked to true
  fetch(`/bookmark_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      bookmarked: true
  })
})
//return back to Homepage
.then( () => {
    build_barrels('home')
  });
}

//Unbookmark barrel based on ID
function unbookmark_barrel(id){

  //change bookmarked to false
  fetch(`/unbookmark_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      bookmarked: false
  })
})
//return back to Homepage
.then( () => {
    build_barrels('home')
  });
}

//turn on alerts for barrel
function start_alerts(id){
  //change alert_off for barrel to False
  fetch(`/start_alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      alert_off: false
    })
  })
.then( () => {
alert("Alerts have been turned on for this barrel")
})
  //return back home
.then( () => {
  single_barrel_load(id)
});
}

//turn of alerts for barrel
function stop_alerts(id){
  //change alert_off for barrel to True
  fetch(`/stop_alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      alert_off: true
    })
  })
.then( () => {
  alert("Alerts have been turned off for this barrel")
})
  //return back home
.then( () => {
  single_barrel_load(id)
});
};
//removes alert based on alert id
function remove_alert(id){
  //hit API to delete alert from database
  const delete_confirmation = confirm("Are you sure you want to remove this alert ?");
  if( delete_confirmation === true ){
  
    fetch(`/remove_alert/${id}`,{
    method: 'DELETE',
    })
    .then( () => {
      alert("This alert has been removed")
    })
    //return back to Homepage
    .then( () => {
      load_alerts()
    })
  }
  };

