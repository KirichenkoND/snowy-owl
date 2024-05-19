# Школа (АИС Школа)

## О проекте
Школа - это программная система, предназначенная для управления школой.


# Содержание <a name="Содержание"></a>
* [Содержание](#Содержание)
* [Роли в команде](#Роли)
* [Стек технологий](#Стек)
* [Use Case Диаграмма](#usecase)
* [База данных](#БДшка)
* [API и SWAGGER](#API_SWAGGER)
* [Docker](#Docker)


# Роли в команде <a name="Роли"></a>
* Тимлид [Кириченко Н.Д.](https://github.com/KirichenkoND)
* Frontend-Разработчик (Разработчик) [Кирилин Г.Д.](https://github.com/FaneOfficial)
* Backend-Разработчик [Шустров В.Р.](https://github.com/ItsEthra)


# Стек технологий <a name="Стек"></a>
В этом проекте используется следующий стек технологий:
* СУБД - PostgreSQL
* Frontend - React + TS + Vite
* Backend - Rust


# Use Case Диаграмма <a name="usecase"></a>
![Alt-текст](img/101_usecase.jpg "Схема Базы данных")


# База данных <a name="БДшка"></a>
В данной программной системе используется СУБД PostgreSQL.
Структура базы данных выглядит следующим образом:

![Alt-текст](img/100_database.jpg "Схема Базы данных")


# API и SWAGGER <a name="API_SWAGGER"></a>
Swagger расположен по следующей ссылке: [*swagger*](http://api.school.efbo.ru/swagger-ui/)





## Описание макетов приложения
1. Авторизация
![Alt-текст](img/1_auth.jpg "Авторизация")

1. Главная страница
![Alt-текст](img/2_mainpage_1.jpg "Главная страница")
![Alt-текст](img/2_mainpage_2.jpg "Главная страница")
![Alt-текст](img/2_mainpage_3.jpg "Главная страница")

1. Профиль
![Alt-текст](img/3_profile.jpg "Профиль")

1. Классы
![Alt-текст](img/4_classes_1.jpg "Классы")
![Alt-текст](img/4_classes_2.jpg "Классы")

1. Предметы
![Alt-текст](img/5_subjects_1.jpg "Предметы")
![Alt-текст](img/5_subjects_2.jpg "Предметы")

1. Кабинеты
![Alt-текст](img/6_rooms_1.jpg "Кабинеты")
![Alt-текст](img/6_rooms_2.jpg "Кабинеты")

1. Учителя
![Alt-текст](img/7_teachers_1.jpg "Учителя")
![Alt-текст](img/7_teachers_2.jpg "Учителя")

1. Ученики
![Alt-текст](img/8_students_1.jpg "Ученики")
![Alt-текст](img/8_students_2.jpg "Ученики")

1. Оценки
![Alt-текст](img/9_marks_1.jpg "Оценки")
![Alt-текст](img/9_marks_2.jpg "Оценки")
![Alt-текст](img/9_marks_3.jpg "Оценки")

1. Настройки
![Alt-текст](img/50_settings.jpg "Настройки категорий")


# Docker <a name="Docker"></a>
Для сборки проекта необходимо скачать и установить docker. 
* Windows<br>Скачать с официального сайта Docker
* Linux<br>```sudo apt install docker```


# Сбор и запуск контейнера backend в Docker
```
cd backend
docker build -t school-backend .
docker run --name securitypass-backend -e DATABASE_URL=<postgres_url> -d -p 9009:9000 securitypass-backend
```


# Сбор и запуск контейнера frontend в Docker
```
cd frontend
docker build -t school-frontend .
docker run --name securitypass-frontend -d -p 7005:5173 securitypass-frontend
```