# Xueying Wang Portfolio Website

Personal portfolio website built with Spring Boot + Thymeleaf, with project cards populated from static JSON data.

## Tech Stack

- Java 21
- Spring Boot 2.7.10 (`spring-boot-starter-web`, `thymeleaf`, `actuator`)
- Maven build system
- Frontend: HTML, CSS, vanilla JavaScript

## Local Development

Prerequisites:

- JDK 21
- Maven 3.9+

Install and run:

```bash
mvn -DskipTests clean package
mvn -DskipTests spring-boot:run
```

App URL:

- `http://localhost:8081/`

Run packaged JAR:

```bash
java -jar target/Xueying_website-0.0.1-SNAPSHOT.jar
```

## Project Structure

```text
src/
  main/
    java/com/xueying/
      PortfolioApplication.java
      controller/HomeController.java
    resources/
      templates/index.html
      static/
        css/
        js/main.js
        data/projects.json
        images/
        files/resume.pdf
```

## Updating Project Cards

- Project card content is stored in `src/main/resources/static/data/projects.json`
- Projects section mount point is in `src/main/resources/templates/index.html`
- Renderer is in `src/main/resources/static/js/main.js`
- Keep `index.html` free of hardcoded duplicate project card content
- To update project title, summary, tags, details, diagrams, video path, or GitHub link, edit `projects.json`
- If browser content looks stale during local development, use `Ctrl + F5` or DevTools Network with Disable cache

## Build & Deployment

- Build artifact: `target/Xueying_website-0.0.1-SNAPSHOT.jar`
- Deployment configuration in repo: TODO (no `Dockerfile`, `vercel.json`, `netlify.toml`, or CI workflow found)
- Live site URL / hosting platform: TODO

## License

No license file is currently present in this repository.  
TODO: add an explicit license if you plan to open-source this project.
