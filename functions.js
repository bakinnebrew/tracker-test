
document.addEventListener('DOMContentLoaded', function() {

  window.onpopstate = function(event) {
    console.log(event.state.view)
    build_barrels(event.state.view)
  }

  document.querySelectorAll('button').forEach(button => {
    button.onclick = function() {
      const view = this.dataset.view;
      history.pushState({view: view}, "", `${view}`);
    };
  });
    document.querySelector('#homepage').addEventListener('click', () => build_barrels('home'));
    document.querySelector('#archived').addEventListener('click', () => build_barrels('archived'));
    document.querySelector('#account').addEventListener('click', () => load_account());
    
    build_barrels('home')
  });




function filter_barrels(){
  const filter_params = document.querySelector('#beer_style').value;

  document.querySelector('#barrels-view').style.display = 'block'; 
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#single-barrel-view').style.display = 'none';

  document.querySelector('#barrels-view').innerHTML = `<h3>Filtered Results: ${filter_params}</h3>`;

  fetch(`/filter/${filter_params}`)
    .then(response => response.json())
    .then(barrels => {
      console.log(barrels)

      barrels.forEach(barrels => {

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
  })
  .catch(error => {
    console.log('error:', error )
    const no_barrel_error = document.createElement('h3');
    no_barrel_error.innerHTML = 'No Results Found'
    document.querySelector('#barrels-view').append(no_barrel_error)
    });
}



function bookmarked_barrel_counter(){
  fetch(`/build_barrels/bookmarked`) 
    .then(response => response.json())
    .then(barrels => {
      var counter = 0;
      for(var i = 0; i < barrels.length; i++){
        counter++;
      }
      
      return counter;
    });
    
};


function load_account(){

  const parent = document.getElementById("account-view")
    while (parent.firstChild) {
     parent.firstChild.remove()
    }

  document.querySelector('#barrels-view').style.display = 'none'; 
  document.querySelector('#account-view').style.display = 'block';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#filter-view').style.display = 'none';

  fetch('/load_account')
    .then(response => response.json())
    .then(account => {
      console.log(account)
      const account_header = document.createElement('h1')
      const account_owner_email = document.createElement('div')
      const account_owner_date_joined = document.createElement('div')
      const account_owner_barrel_count = document.createElement('div')
      const account_bookmarked_barrel_button = document.createElement('button')
      const bookmark_barrel_count = bookmarked_barrel_counter()

      account_bookmarked_barrel_button.innerHTML = "Bookmarked Barrels " + bookmark_barrel_count;
      account_bookmarked_barrel_button.addEventListener('click', function() {
        build_barrels('bookmarked')
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
    });
}


function build_barrels(build_view){

  document.querySelector('#barrels-view').style.display = 'block'; 
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#single-barrel-view').style.display = 'none';
  document.querySelector('#filter-view').style.display = 'block';

  document.querySelector('#barrels-view').innerHTML = `<h3>${build_view.charAt(0).toUpperCase() + build_view.slice(1)}</h3>`;

  fetch(`/build_barrels/${build_view}`) 
    .then(response => response.json())
    .then(barrels => {
      console.log(barrels);

      barrels.forEach(barrels => {

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
    
  })
  .catch(error => {
    console.log('error:', error )
    const no_barrel_error = document.createElement('h3');
    no_barrel_error.innerHTML = 'You have no barrels in this category'
    document.querySelector('#barrels-view').append(no_barrel_error)
    });
};



function single_barrel_load(id){
  document.querySelector('#single-barrel-view').style.display = 'block';
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#barrels-view').style.display = 'none'; 
  document.querySelector('#filter-view').style.display = 'none';

  fetch(`/single_barrel_load/${id}`)
    .then(response => response.json())
    .then(barrel => {
      console.log(barrel);

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

        barrel_estimated_ABV.innerHTML = "Estimated ABV:  " + barrel.estimated_ABV +"%";
        barrel_description.innerHTML = "Description:  " + barrel.description;
        barrel_beer_style.innerHTML = "Beer Style:  " + barrel.beer_style;
        barrel_category.innerHTML = "Barrel Type:  " + barrel.barrel_category;
        barrel_fill_date.innerHTML = "Barrel Fill Date:  " + barrel.fill_date;
        barrel_pull_date.innerHTML = "Estimated Pull Date:  " + barrel.pull_date;
        const barrel_id = barrel.id;

        const barrel_bookmarked = barrel.bookmarked;
        barrel_bookmark_button.innerHTML = "Bookmark Barrel"
        barrel_bookmark_button.addEventListener('click', function() {
          bookmark_barrel(barrel_id)
        })

        barrel_unbookmark_button.innerHTML = "Unbookmark Barrel"
        barrel_unbookmark_button.addEventListener('click', function() {
          unbookmark_barrel(barrel_id)
        })

        const barrel_archived = barrel.archived;
        barrel_archive_button.innerHTML = "Archive Barrel";
        barrel_archive_button.addEventListener('click', function() {
          archive_barrel(barrel_id)
        })
        barrel_unarchive_button.innerHTML = "Unarchive Barrel";
        barrel_unarchive_button.addEventListener('click', function() {
          unarchive_barrel(barrel_id)
        })
        barrel_delete_button.innerHTML = "Delete Barrel"
        barrel_delete_button.addEventListener('click', function() {
          delete_barrel(barrel_id)
        })

        document.querySelector('#single-barrel-view').append(barrel_estimated_ABV);
        document.querySelector('#single-barrel-view').append(barrel_beer_style);
        document.querySelector('#single-barrel-view').append(barrel_category);
        document.querySelector('#single-barrel-view').append(barrel_fill_date);
        document.querySelector('#single-barrel-view').append(barrel_pull_date);
        document.querySelector('#single-barrel-view').append(barrel_description);
        document.querySelector('#single-barrel-view').append(barrel_delete_button)
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
        })
   
  }


function archive_barrel(id){

  fetch(`/archive_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then( () => {
    build_barrels('home')
  });
}

function unarchive_barrel(id){

  fetch(`/unarchive_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then( () => {
    build_barrels('home')
  });
}

function delete_barrel(id){

  const delete_confirmation = confirm("Are you sure you want to delete this barrel ?");
  if( delete_confirmation === true ){
  
    fetch(`/delete_barrel/${id}`,{
    method: 'DELETE',
    })
    .then( () => {
      alert("This barrel has been deleted")
    })
    .then( () => {
      build_barrels('home')
    })
  }
};

function bookmark_barrel(id){

  fetch(`/bookmark_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      bookmarked: true
  })
})
.then( () => {
    build_barrels('home')
  });
}

function unbookmark_barrel(id){

  fetch(`/unbookmark_barrel/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      bookmarked: false
  })
})
.then( () => {
    build_barrels('home')
  });
}

