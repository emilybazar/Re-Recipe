import { Component, OnInit } from '@angular/core';
import { RecipeservicesService } from '../../recipeservices.service';
import { IRecipe } from '../model/IRecipe';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css'],
})
export class DiscoverComponent implements OnInit {
  recipeList: IRecipe[] = [];
  selectedRecipes: Set<string> = new Set(); // Track selected recipes by their IDs
  loading: boolean = true;
  error: string | null = null;
  searchQuery: string = '';
  selectedCategory: string = '';
  maxCookingDuration: number | null = null;

  constructor(private recipeService: RecipeservicesService) {}

  ngOnInit(): void {
    this.getRecipes();
  }

  getRecipes(): void {
    this.recipeService.getRecipes().subscribe(
      (data) => {
        this.recipeList = data;
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load recipes.';
        this.loading = false;
      }
    );
  }

  get uniqueCategories(): string[] {
    const categories = this.recipeList.flatMap(
      (recipe) => recipe.meal_category || []
    );
    return Array.from(new Set(categories)).sort();
  }

  filteredRecipes(): IRecipe[] {
    return this.recipeList.filter((recipe) => {
      const matchesSearch = recipe.recipe_name
        ?.toLowerCase()
        .includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory
        ? recipe.meal_category?.some(
            (category) => category === this.selectedCategory
          )
        : true;

      return matchesSearch && matchesCategory;
    });
  }

  toggleRecipeSelection(recipeId: string): void {
    if (this.selectedRecipes.has(recipeId)) {
      this.selectedRecipes.delete(recipeId); // Remove from selection
    } else {
      this.selectedRecipes.add(recipeId); // Add to selection
    }
  }

  saveSelectedRecipes(): void {
    const selectedRecipeIds = this.recipeList
      .filter((recipe) => this.selectedRecipes.has(recipe.recipe_ID))
      .map((recipe) => recipe.recipe_ID);

    console.log('Saving recipes:', selectedRecipeIds);
    this.recipeService.createCookbookRecipes(selectedRecipeIds).subscribe(
      (response) => {
        console.log('good job ben, you saved it!', response);
      },
      (error) => {
        console.error('whoopsie', error);
      }
    );
  }
}
