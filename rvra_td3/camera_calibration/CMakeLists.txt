project(rv_calibration)

cmake_minimum_required(VERSION 2.6)

if (NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE "RelWithDebInfo")
endif()

set(CMAKE_MODULE_PATH ${PROJECT_SOURCE_DIR}/cmake)

find_package(OpenCV REQUIRED)

include_directories(${OpenCV2_INCLUDE_DIRS})

set(SRCS camera_calibration.cpp)

add_executable(camera_calibration ${SRCS})

target_link_libraries(camera_calibration ${OpenCV2_LIBRARIES})

if(APPLE)
  target_link_libraries(camera_calibration "-framework Foundation" "-framework Cocoa")
endif()
