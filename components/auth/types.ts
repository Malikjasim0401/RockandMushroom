export type AuthMode = 'signIn' | 'signUp' | 'reset';

export type CredentialsMode = Exclude<AuthMode, 'reset'>;
