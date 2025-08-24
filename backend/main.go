package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"sort"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Article struct {
	Title       string    `json:"title"`
	PublishedAt time.Time `json:"published_at"`
	Path        string    `json:"path"`
	LikedCount  int       `json:"liked_count"`
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

		page, err := strconv.Atoi(c.QueryParam("page"))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err.Error())
		}
		limit, err := strconv.Atoi(c.QueryParam("limit"))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, err.Error())
		}
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 20
		}
		offset := (page - 1) * limit
		end := min(offset + limit, len(articles.Articles))

		var pagedArticle []Article
		if offset < len(articles.Articles) {
			pagedArticle = articles.Articles[offset:end]
		}
		return c.JSON(http.StatusOK, pagedArticle)
	})

	e.Logger.Fatal(e.Start(":8081"))
}
