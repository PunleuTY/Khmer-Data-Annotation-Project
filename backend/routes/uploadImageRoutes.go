package routes

import (
	"backend/controllers"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRoutes(router *gin.Engine, imageCollection *mongo.Collection) {
	router.POST("/upload", controllers.UploadImages(imageCollection))
	router.POST("/save-groundtruth", controllers.SaveGroundTruth(imageCollection))
}
