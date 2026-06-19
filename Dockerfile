FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/Xueying_website-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 10000

# JVM 启动与内存优化：
# - UseSerialGC：小内存容器下开销最低的垃圾回收器
# - TieredStopAtLevel=1：只用一级即时编译，显著加快冷启动
# - MaxRAMPercentage=70：限制堆内存，避免在 512MB 免费实例上被 OOM
# - lazy-initialization：Spring Bean 延迟加载，进一步缩短启动时间
ENV JAVA_OPTS="-XX:+UseSerialGC -XX:TieredStopAtLevel=1 -XX:MaxRAMPercentage=70.0 -Dspring.main.lazy-initialization=true"

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
