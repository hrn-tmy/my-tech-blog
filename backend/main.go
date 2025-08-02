package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"sort"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Article struct {
	Title       string    `json:"title"`
	PublishedAt time.Time `json:"published_at"`
	Path        string    `json:"path"`
	LikedCount  int
}

type Articles struct {
	Articles []Article `json:"articles"`
}

func main() {
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET"},
		AllowCredentials: true,
	}))
	e.GET("/", func(c echo.Context) error {
		resp, err := http.Get(os.Getenv("TARGET_URL"))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err.Error())
		}
		defer resp.Body.Close()

		data, err := io.ReadAll(resp.Body)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err.Error())
		}
		var articles Articles
		if err := json.Unmarshal(data, &articles); err != nil {
			return c.JSON(http.StatusInternalServerError, err.Error())
		}

		sort.Slice(articles.Articles, func(i, j int) bool {
			return articles.Articles[i].PublishedAt.Before(articles.Articles[j].PublishedAt)
		})
		return c.JSON(http.StatusOK, articles)
	})

	e.Logger.Fatal(e.Start(":8081"))
}
