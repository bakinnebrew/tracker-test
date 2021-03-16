document.addEventListener('DOMContentLoaded', function() {

    document.querySelector('#homepage').addEventListener('click', () => build_barrels('homepage'));
    document.querySelector('#archived').addEventListener('click', () => build_barrels('archives'));
    document.querySelector('#account').addEventListener('click', () => load_account());
    
    build_barrels('homepage')
  });

function load_account(){

  const parent = document.getElementById("account-view")
    while (parent.firstChild) {
     parent.firstChild.remove()
    }

  document.querySelector('#homepage-view').style.display = 'none'; 
  document.querySelector('#account-view').style.display = 'block';
  document.querySelector('#archive-view').style.display = 'none';
  document.querySelector('#add-button').style.display = 'none';
  document.querySelector('#new-barrel-page').style.display = 'none';
  
  fetch('/load_account')
    .then(response => response.json())
    .then(account => {
      console.log(account)
      const account_header = document.createElement('h1')
      const account_owner_email = document.createElement('div')
      const account_owner_date_joined = document.createElement('div')
      const account_owner_barrel_count = document.createElement('div')

      account_header.innerHTML = account.account_owner;
      account_owner_email.innerHTML = "Email:  " + account.email;
      account_owner_date_joined.innerHTML = "Date Joined:  " + account.date_joined;
      account_owner_barrel_count.innerHTML = "Barrels Added:  " + account.barrel_count;

      document.querySelector('#account-view').append(account_header);
      document.querySelector('#account-view').append(account_owner_email);
      document.querySelector('#account-view').append(account_owner_date_joined);
      document.querySelector('#account-view').append(account_owner_barrel_count);
    })
}
function build_barrels(build_view){

  fetch(`/build_barrels/${build_view}`) 
    .then(response => response.json())
    .then(barrels => {
      

      barrels.forEach(barrels => {
        console.log(barrels)

        const barrel_title = document.createElement('h3');
        const barrel_estimated_ABV = document.createElement('div');
        const barrel_beer_style = document.createElement('div');
        const barrel_category = document.createElement('div');
        const barrel_fill_date = document.createElement('div');
        const barrel_pull_date = document.createElement('div');
        const barrel_description = document.createElement('p');

        barrel_title.innerHTML = barrels.title;
        barrel_estimated_ABV.innerHTML = "Estimated ABV:  " + barrels.estimated_ABV +"%";
        barrel_description.innerHTML = "Description:  " + barrels.description;
        barrel_beer_style.innerHTML = "Beer Style:  " + barrels.beer_style;
        barrel_category.innerHTML = "Barrel Type:  " + barrels.barrel_category;
        barrel_fill_date.innerHTML = "Barrel Fill Date:  " + barrels.fill_date;
        barrel_pull_date.innerHTML = "Estimated Pull Date:  " + barrels.pull_date;
      
  if(build_view === 'archives') {

  document.querySelector('#archive-view').style.display = 'block';
  document.querySelector('#add-button').style.display = 'none';
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#new-barrel-page').style.display = 'none';
  document.querySelector('#homepage-view').style.display = 'none'; 
    
  document.querySelector('#archive-view').append(barrel_title);
  document.querySelector('#archive-view').append(barrel_estimated_ABV);
  document.querySelector('#archive-view').append(barrel_beer_style);
  document.querySelector('#archive-view').append(barrel_category);
  document.querySelector('#archive-view').append(barrel_fill_date);
  document.querySelector('#archive-view').append(barrel_pull_date);
  document.querySelector('#archive-view').append(barrel_description);
  }
  else {
   
  document.querySelector('#archive-view').style.display = 'none';
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#new-barrel-page').style.display = 'none';
  document.querySelector('#add-button').style.display = 'block';
  document.querySelector('#new-barrel').addEventListener('click', () => new_barrel()); 
  document.querySelector('#homepage-view').style.display = 'block';

  document.querySelector('#homepage-view').append(barrel_title);
  document.querySelector('#homepage-view').append(barrel_estimated_ABV);
  document.querySelector('#homepage-view').append(barrel_beer_style);
  document.querySelector('#homepage-view').append(barrel_category);
  document.querySelector('#homepage-view').append(barrel_fill_date);
  document.querySelector('#homepage-view').append(barrel_pull_date);
  document.querySelector('#homepage-view').append(barrel_description);

      }
    })
  })
}

function new_barrel(){
  //function that created a new barrel
  document.querySelector('#new-barrel-page').style.display = 'block';
  document.querySelector('#archive-view').style.display = 'none';
  document.querySelector('#account-view').style.display = 'none';
  document.querySelector('#homepage-view').style.display = 'none'; 


}


