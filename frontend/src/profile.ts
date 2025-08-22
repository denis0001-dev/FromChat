// const fileInput = document.getElementById('fileInput') as HTMLInputElement;
// const preview = document.getElementById('preview') as HTMLImageElement;
// const preview1 = document.getElementById('preview1') as HTMLImageElement;
// const button = document.getElementById('uploadButton')!;

// if (fileInput && preview && button) {
//     // при клике по кнопке откроем диалог выбора файла
//     button.addEventListener('click', () => {
//         fileInput.click();
//     });

//     // при выборе файла — показываем его
//     fileInput.addEventListener('change', () => {
//         const file: File | null = fileInput.files ? fileInput.files[0] : null;
//         if (file) {
//             const reader: FileReader = new FileReader();
//             reader.onload = (e: ProgressEvent<FileReader>) => {
//                 if (e.target && typeof e.target.result === 'string') {
//                     preview.src = e.target.result;
//                     preview1.src = e.target.result;
//                     preview.style.display = 'block';
//                 }
//             };
//             reader.readAsDataURL(file);
//         }
//     });
// }

// const textDiv = document.getElementById('text-nik')!;
// const input = document.getElementById('nik') as HTMLInputElement;
// const button1 = document.getElementById('change-name')!;

// button1.addEventListener('click', () => {
//     if (input.style.display === 'none') {
//         // Переводим в режим редактирования
//         input.value = textDiv.textContent || '';
//         textDiv.style.display = 'none';
//         input.style.display = 'flex';
//     } else {
//         // Сохраняем изменения
//         textDiv.textContent = input.value;
//         textDiv.style.display = 'flex';
//         input.style.display = 'none';
//     }
// });

// const textDiv2 = document.getElementById('text-discr')!;
// const input2 = document.getElementById('discr') as HTMLInputElement;
// const button2 = document.getElementById('change-discription')!;

// button2.addEventListener('click', () => {
//     if (input2.style.display === 'none') {
//         // Переводим в режим редактирования
//         input2.value = textDiv2.textContent || '';
//         textDiv2.style.display = 'none';
//         input2.style.display = 'flex';
//     } else {
//         // Сохраняем изменения
//         textDiv2.textContent = input2.value;
//         textDiv2.style.display = 'flex';
//         input2.style.display = 'none';
//     }
// });