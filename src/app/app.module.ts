import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';  // Import HttpClientModule
import { routes } from './routes';

@NgModule({
  imports: [
      RouterModule.forRoot(routes),
      HttpClientModule  // Add HttpClientModule here
      // ... other imports
   ],
   // ... declarations, providers, etc.
 })
export class AppModule { }

