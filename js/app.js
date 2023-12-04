function startApp(){

    const selectCategories = document.querySelector('#categorias');
    const result = document.querySelector('#resultado');

    if(selectCategories){
        selectCategories.addEventListener('change', selecCategory);
        getCategories();
    }
    const favoritesDiv = document.querySelector('.favoritos');
    if(favoritesDiv){
        getFavorites();
    }
    

    
    const modal = new bootstrap.Modal('#modal', {});

    

    function getCategories(){
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
        fetch(url)
            .then(response => response.json())
            .then(result => showCategories(result.categories))
    }

    function showCategories(categories = []){
        categories.forEach(category => {
            const {strCategory} = category;
            const option = document.createElement('OPTION');
            option.value = strCategory;
            option.textContent = category.strCategory;
            selectCategories.appendChild(option);
        })
    }

    function selecCategory(e){
        const category = e.target.value
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
        fetch(url)
            .then(response => response.json())
            .then(result => showRecipes(result.meals))
    }

    function showRecipes(recipes = []){
        
        cleanHtml(result);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recipes.length ? 'Results': "There aren't results";
        result.appendChild(heading);

        // Iterate in the results
        recipes.forEach(recipe => {
            const {idMeal, strMeal, strMealThumb} = recipe
            const recipeContainer = document.createElement('DIV');
            recipeContainer.classList.add('col-md-4');

            const recipeCard = document.createElement('DIV');
            recipeCard.classList.add('card', 'mb-4');
            
            const recipeImage = document.createElement('IMG');
            recipeImage.classList.add('card-img-top');
            recipeImage.alt = `Image od the recipe ${strMeal ?? recipe.title}`;
            recipeImage.src = strMealThumb ?? recipe.img;

            const recipeCardBody = document.createElement('DIV');
            recipeCardBody.classList.add('card-body');

            const recipeHeading = document.createElement('H3');
            recipeHeading.classList.add('card-title', 'mb-3');
            recipeHeading.textContent = strMeal ?? recipe.title;

            const recipeButton = document.createElement('BUTTON');
            recipeButton.classList.add('btn', 'btn-danger', 'w-100');
            recipeButton.textContent = 'See Recipe';
            // recipeButton.dataset.bsTarget = "#modal";
            // recipeButton.dataset.bsToggle = "modal";
            recipeButton.onclick = function(){
                selectRecipe(idMeal ?? recipe.id)
            }


            // Inject in the HTML code

            recipeCardBody.appendChild(recipeHeading);
            recipeCardBody.appendChild(recipeButton);

            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeCardBody);

            recipeContainer.appendChild(recipeCard);

            result.appendChild(recipeContainer);
        })
    }
    function selectRecipe(id){
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(response => response.json())
            .then(result => showRecipeModal(result.meals[0]))
    }

    function showRecipeModal(recipe){

        const {idMeal, strInstructions, strMeal, strMealThumb} = recipe;

        // Add content to the modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="recipe ${strMeal}" />
            <h3 class="my-3">Instructions</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredients and Amounts</h3>
        `;

        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');
        // Show amounts and ingredients
        for(let i = 1; i <= 20; i++){
            if(recipe[`strIngredient${i}`]){
                const ingredient = recipe[`strIngredient${i}`];
                const amount = recipe[`strMeasure${i}`];

                const ingredientLi = document.createElement('LI');
                ingredientLi.classList.add('list-group-item');
                ingredientLi.textContent = `${ingredient} - ${amount}`

                listGroup.appendChild(ingredientLi);
            }
        }

        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        cleanHtml(modalFooter);

        // Buttons of close and favorite 
        const btnFavorite = document.createElement('BUTTON');
        btnFavorite.classList.add('btn', 'btn-danger', 'col');
        btnFavorite.textContent = existStorage(idMeal) ? 'Delete favorite' : 'Save Favorite';

        // localStorage
        btnFavorite.onclick = function(){

            if(existStorage(idMeal)){
                deleteFavorite(idMeal);
                btnFavorite.textContent = 'Save Favorite';
                showToast('Deleted Correctly');
                return
            };

            addFavorite({
                id: idMeal,
                title: strMeal,
                img: strMealThumb
            });
            btnFavorite.textContent = 'Delete Favorite';
            showToast('Added correctly');
        }

        const btnCloseModal = document.createElement('BUTTON');
        btnCloseModal.classList.add('btn', 'btn-secondary', 'col');
        btnCloseModal.textContent = 'Close';
        btnCloseModal.onclick = function(){
            modal.hide();
        }

        modalFooter.appendChild(btnFavorite);
        modalFooter.appendChild(btnCloseModal);


        // Show the modal
        modal.show();
    }

    function addFavorite(recipe){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        localStorage.setItem('favorites', JSON.stringify([...favorites, recipe]))
    }

    function deleteFavorite(id){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        const newFavorites = favorites.filter(favorite => favorite.id !== id);
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
    }

    function existStorage(id){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        return favorites.some(favorite => favorite.id === id);
    }

    function showToast(message){
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = message;
        toast.show();
    }
    
    function getFavorites(){
        const favorites = JSON.parse(localStorage.getItem('favorites')) ?? [];
        if(favorites.length){
            showRecipes(favorites);
            return
        }

        const noFavorites = document.createElement('P');
        noFavorites.textContent = "Still there aren't favorites";
        noFavorites.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritesDiv.appendChild(noFavorites);
    }

    function cleanHtml(selector){
        while(selector.firstChild){
            selector.removeChild(selector.firstChild);
        }
    }
}

document.addEventListener('DOMContentLoaded', startApp);