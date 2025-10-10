function showRegister() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('register-screen').classList.remove('hidden');
}

const otpInputs = document.querySelectorAll('.otp-group input');
otpInputs.forEach((input, index) => {
  input.addEventListener('input', () => {
    if (input.value && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
    const allFilled = Array.from(otpInputs).every(inp => inp.value);
    document.getElementById('verify-btn').disabled = !allFilled;
  });
});

document.getElementById('register-btn').addEventListener('click', () => {
  document.querySelector('.loader').classList.remove('hidden');
  setTimeout(() => {
    alert('Ro‘yxatdan o‘tish muvaffaqiyatli!');
    document.querySelector('.loader').classList.add('hidden');
  }, 2000);
});