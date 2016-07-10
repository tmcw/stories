module Main exposing (..)

import Http
import Task
import List
import Html exposing (..)
import Html.App as Html
import Html.Attributes exposing (..)
import Html.Events exposing (on, onClick, onWithOptions)
-- import Json.Decode as Json exposing ((:=))
import Mouse exposing (Position)
import Maybe exposing (withDefault)
import Json.Encode
import Json.Decode exposing ((:=))
import Json.Decode.Pipeline


main =
    Html.program
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- MODEL


type alias Model =
    { historyIndex : Int
    , history : List (List Position)
    }


init : ( Model, Cmd Msg )
init =
    ( Model 0 [ [] ], loadTweets )



-- UPDATE


type Msg
    = Click Position
    | RemoveDot Position
    | Undo
    | Redo
    | FetchSucceed String
    | FetchFail Http.Error


nextModel : Model -> List Position -> ( Model, Cmd Msg )
nextModel model next =
    ( { model
        | history = (List.take (model.historyIndex + 1) model.history) ++ [ next ]
        , historyIndex = model.historyIndex + 1
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ history, historyIndex } as model) =
    case msg of
        Click xy ->
            nextModel model ((getCurrent model) ++ [ xy ])

        RemoveDot xy ->
            nextModel model (List.filter ((/=) xy) (getCurrent model))

        Undo ->
            ( { model
                | historyIndex = (Basics.max 0 (historyIndex - 1))
              }
            , Cmd.none
            )

        Redo ->
            ( { model
                | historyIndex = (Basics.min ((List.length history) - 1) (historyIndex + 1))
              }
            , Cmd.none
            )


getCurrent : Model -> List Position
getCurrent model =
    withDefault []
        (model.history
            |> List.drop model.historyIndex
            |> List.head
        )

type alias Tweets = List Tweet

type alias Tweet =
    { iD : String
    , postedAt : String
    , screenName : String
    , text : String
    }

decodeTweets : Json.Decode.Decoder (List Tweet)
decodeTweets =
    Json.Decode.Pipeline.decode (List Tweet)
      |> list
        |> Json.Decode.Pipeline.required "iD" (Json.Decode.string)
        |> Json.Decode.Pipeline.required "posted at" (Json.Decode.string)
        |> Json.Decode.Pipeline.required "screen name" (Json.Decode.string)
        |> Json.Decode.Pipeline.required "text" (Json.Decode.string)

-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


loadTweets : Cmd Msg
loadTweets =
  Task.perform FetchFail FetchSucceed (Http.get decodeTweets "./tweets-new.json")



-- VIEW


(=>) =
    (,)



buttonStyle : Bool -> List ( String, String )
buttonStyle disabled =
    [ "border-radius" => "5px"
    , "margin" => "5px"
    , "border-width" => "0"
    , "background"
        => if disabled then
            "#aaa"
           else
            "#2969B0"
    , "color" => "#fff"
    ]


view : Model -> Html Msg
view model =
    div []
        [ (div
            [ style
                [ "background-color" => "#eeeeee"
                , "width" => "600px"
                , "height" => "200px"
                ]
            ]
            (List.map
                (\dot ->
                    (div
                        [ style
                            [ "background-color" => "#EB6B56"
                            , "cursor" => "move"
                            , "width" => "20px"
                            , "height" => "20px"
                            , "margin-left" => "-10px"
                            , "margin-top" => "-10px"
                            , "border-radius" => "10px"
                            , "position" => "absolute"
                            , "left" => px dot.x
                            , "top" => px dot.y
                            ]
                        ]
                        []
                    )
                )
                (getCurrent model)
            )
          )
        , (button
            [ onClick Undo
            , style (buttonStyle (model.historyIndex == 0))
            ]
            [ text "Undo" ]
          )
        , (button [ onClick Redo, style (buttonStyle (model.historyIndex == (List.length model.history) - 1)) ] [ text "Redo" ])
        ]


px : Int -> String
px number =
    toString number ++ "px"

