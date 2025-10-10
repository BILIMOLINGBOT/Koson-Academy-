body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: #0B0C10;
  color: #FFFFFF;
}

main {
  max-width: 400px;
  margin: auto;
  padding: 20px;
}

.logo {
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  color: #FFD700;
  text-align: center;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  margin-bottom: 20px;
}

h2 {
  text-align: center;
  font-family: 'Poppins', sans-serif;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  align-items: center;
  background-color: #1F1F1F;
  border-radius: 12px;
  padding: 10px;
  margin-bottom: 20px;
}

.input-group input {
  border: none;
  background: transparent;
  color: #FFD700;
  font-size: 16px;
  flex: 1;
}

.flag {
  margin-right: 10px;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(45deg, #0066FF, #8A2BE2);
  color: white;
  font-size: 16px;
  cursor: pointer;
}

button:disabled {
  background-color: #444;
  cursor: not-allowed;
}

.link {
  text-align: center;
  margin-top: 10px;
}

.otp-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.otp-group input {
  width: 60px;
  height: 60px;
  font-size: 24px;
  text-align: center;
  border-radius: 12px;
  border: 2px solid #FFD700;
}

.timer {
  text-align: center;
  margin-bottom: 20px;
}

.dob-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

select {
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  border: none;
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FFD700;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hidden {
  display: none;
}