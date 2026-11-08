@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%
echo JAVA_HOME=%JAVA_HOME%
java -version
cd /d c:\NSO(NEW SHOPPIMG ORBIT)\android
call gradlew.bat assembleDebug --no-daemon
