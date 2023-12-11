import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from './routes';

@NgModule({
  imports: [
      RouterModule.forRoot(routes)
          // ... other imports
   ],
              // ... declarations, providers, etc.
 })
 export class AppModule { }
