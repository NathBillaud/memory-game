/*export function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    return re.test(password);
  }*/

export function validatePassword(password) {
  if (password.length < 6) {
    return false;
  }

  let hasNumber = false;
  let hasLetter = false;
  let hasSpecial = false;

  for (let i = 0; i < password.length; i++) {
    const char = password[i];

    if (char >= "0" && char <= "9") {
      hasNumber = true;
    } else if ((char >= "a" && char <= "z") || (char >= "A" && char <= "Z")) {
      hasLetter = true;
    } else {
      // Si ce n'est ni une lettre ni un chiffre, c'est un caractère spécial
      hasSpecial = true;
    }
  }

  return hasNumber && hasLetter && hasSpecial;
}

// Le mot de passe est valide si toutes les conditions sont remplies

export function evaluatePasswordStrength(password) {
  let hasNumber = /\d/.test(password);
  let hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  let length = password.length;

  if (length < 6) {
    return "faible";
  } else if (length >= 9 && hasNumber && hasSpecial) {
    return "fort";
  } else if (length >= 6 && (hasNumber || hasSpecial)) {
    return "moyen";
  } else {
    return "faible";
  }
}
