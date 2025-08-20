# Гайд по работе с проектом

## Важные моменты
- Для работы с проектом нужна Windows 10/11.
- Нужно открывать **именно** _Windows PowerShell_, **НЕ** _Windows PowerShell ISE_. Если видны варианты с x86 и x64, выбирайте x64. 
- Если в шаге 3.1 вас попросят установить пакет `python<xxx>-venv`, выполните `sudo apt install <пакет, который просят установить>` и повторите шаг. 
- Если VS Code предупредит вас о том, что у вас WSL 2, закройте VS Code и выполните команду в PowerShell: `wsl --set-version Ubuntu 2`

## 1. Установка WSL
1. Откройте PowerShell от имени администратора и выполните команду: 
   ```powershell
   dism.exe /online /enable-feature /all /featurename:Microsoft-Windows-Subsystem-For-Linux /featurename:VirtualMachinePlatform
   ```
   Если не заработает, пропускайте этот шаг.

2. Перезагрузите компьютер.
3. Снова откройте PowerShell от имени администратора и выполните `wsl --install -d Ubuntu`. После установки создайте имя пользователя и пароль для своей Linux-системы.

## 2. Настройка VS Code
1. Запустите VS Code. 
2. Перейдите в Extensions (значок кубиков слева) и установите расширение Remote - WSL или просто WSL. Расширение должно быть от Microsoft.
3. Нажмите на синюю кнопку в нижнем левом углу и нажмите _Connect to WSL_.

## 3. Настройка среды
1. Откройте терминал (Terminal > New Terminal) и выполните команду:

   ```bash
   # Установка Python и Node.js
   sudo apt update 
   sudo apt install nodejs npm python3 python3-pip python3.12-venv
   # Установка nvm
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
   export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm

   # Установка Node.js 24
   nvm install 24 
   nvm use 24
   ```

2. В VS Code нажмите Ctrl+Shift+P и введите _Git: Clone Repository_. Введите URL репозитория в полезных ссылках. В диалоге выбора папки введите _/home/<ваше имя пользователя в WSL>_.
3. Выполните `npm install`, что установить зависимости.

## 4. Работа с проектом
Чтобы запустить проект, выполните `npm run dev` или нажмите Ctrl+Shift+B. Проект запустится по адресу http://localhost:8301.