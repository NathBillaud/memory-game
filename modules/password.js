/*export function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    return re.test(password);
  }*/

  export function validatePassword(password) {
    if (password.length < 6) {
      return false; 
    }
    //  doit comprendre 1 chiffre 1 symbole et 6 caractères mini   
    let hasNumber = false;   
    let hasChar = false;
    let hasSpecial = false;
  
    for (let i = 0; i < password.length; i++) {
      const char = password[i];
  
      // Vérifie si c'est un chiffre
      if (char >= '0' && char <= '9') {
        hasNumber = true;
      }
      // Vérifie si c'est une minuscule
      else if (char >= 'a' && char <= 'z') {
        hasChar = true;
      }
      // Vérifie si ce n'est ni une lettre ni un chiffre => caractère spécial
      else if (
        !(char >= '0' && char <= '9')
      ) {
        hasSpecial = true;
      }
    }
  
    // Le mot de passe est valide si toutes les conditions sont remplies

    return hasNumber && hasChar && hasSpecial;
  }