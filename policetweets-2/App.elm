module Main exposing (..)

import Http
import Task
import List
import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Regex exposing (..)
import Json.Encode
import Json.Decode exposing (..)
import Json.Decode.Pipeline


main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL

type alias Tweet =
  {
    tweet : String,
    matches : (List Match)
  }

type alias Model =
    { tweets : List (String)
    , displayedResults : List Tweet
    , regex: Regex
    }


init : ( Model, Cmd Msg )
init =
    ( Model [ ] [ ] (Regex.regex ""), loadTweets )


-- UPDATE


type Msg = FetchSucceed (List String)
    | FetchFail Http.Error
    | UpdateRegex String


computeDisplayed : List String -> Regex -> List Tweet
computeDisplayed tweets regex =
  tweets
    |> List.map (\tweet -> { tweet = tweet, matches = (find All regex tweet) })
    |> List.filter (\tweet -> not (List.isEmpty tweet.matches))

update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ tweets } as model) =
    case msg of
        FetchSucceed data ->
            ({
              model | tweets = data
            }, Cmd.none)
        FetchFail err -> (model, Cmd.none)
        UpdateRegex str -> ({
          model |
            regex = (Regex.regex str)
            , displayedResults = (computeDisplayed model.tweets (Regex.regex str))
        }, Cmd.none)


decodeTweets : Decoder (List String)
decodeTweets =
    Json.Decode.list string

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


loadTweets : Cmd Msg
loadTweets =
  Task.perform FetchFail FetchSucceed (Http.get decodeTweets "./tweets.json")



-- VIEW


(=>) =
    (,)



view : Model -> Html Msg
view model =
    div [
      style
        [ "max-width" => "1000px"
        , "color" => "#554"
        , "margin" => "20px auto"
        , "font-family" => "Helvetica"
        ]
      ]
    [
      (input [
        (onInput UpdateRegex)
        , style
        [ "type" => "text"
        , "font-size" => "40px"
        , "width" => "100%"
        , "font-family" => "monospace"
        ]
      ] [])
      , (div []
      (List.map (\tweet ->
        div [
          style
            [ "padding" => "5px"
            ]
          ] [text tweet.tweet])
      model.displayedResults))
      ]
