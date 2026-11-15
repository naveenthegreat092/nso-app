@echo off
if exist "C:\Users\ADMIN\jdk21\jdk-21.0.2+13" (
    set "JAVA_HOME=C:\Users\ADMIN\jdk21\jdk-21.0.2+13"
) else if exist "C:\Users\ADMIN\jdk17\jdk-17.0.10+7" (
    set "JAVA_HOME=C:\Users\ADMIN\jdk17\jdk-17.0.10+7"
) else (
    set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
)
set PATH=%JAVA_HOME%\bin;%PATH%
echo JAVA_HOME=%JAVA_HOME%
java -version
cd /d c:\NSO(NEW SHOPPIMG ORBIT)\android
call gradlew.bat assembleDebug --no-daemon
