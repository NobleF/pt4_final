import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  BehaviorSubject ,  ReplaySubject } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt.service';
import { User } from '../models';
import { map ,  distinctUntilChanged } from 'rxjs/operators';


@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();

  constructor (
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService
  ) {}

  // vérifie JWT dans le stockage local avec le serveur et charge les infos de l'utilisateur.
  // ne se lance qu'une fois au démarrage de l'application.
  populate() {
    // si JWT est détecté, essaie de le get et stock les infos de l'utilisateur
    if (this.jwtService.getToken()) {
      this.apiService.get('/user')
      .subscribe(
        data => this.setAuth(data.user),
        err => this.purgeAuth()
      );
    } else {
      // purge les résidus potentiels de précédents états d'authentification
      this.purgeAuth();
    }
  }

  setAuth(user: User) {
    // sauvegarde JWT envoyé depuis le serveur dans le stockage local
    this.jwtService.saveToken(user.token);
    // place les données utilisateurs actuelles dans un observable
    this.currentUserSubject.next(user);
    // met isAuthenticated à vrai
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // retire JWT du stockage local
    this.jwtService.destroyToken();
    // place l'utilisateur actuel dans un objet vide
    this.currentUserSubject.next({} as User);
    // met le statut d'authentification à faux
    this.isAuthenticatedSubject.next(false);
  }

  attemptAuth(type, credentials): Observable<User> {
    const route = (type === 'login') ? '/login' : '';
    return this.apiService.post('/users' + route, {user: credentials})
      .pipe(map(
      data => {
        this.setAuth(data.user);
        return data;
      }
    ));
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  // met à jour l'utilisateur sur le serveur (mail, mdp, ...)
  update(user): Observable<User> {
    return this.apiService
    .put('/user', { user })
    .pipe(map(data => {
      // met à jour l'observable currentUser
      this.currentUserSubject.next(data.user);
      return data.user;
    }));
  }

}
