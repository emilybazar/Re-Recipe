import * as express from "express";
import * as bodyParser from "body-parser"; // For parsing URL requests and JSON
import { DiscoverModel } from "./model/DiscoverModel";
import { CookbookModel } from "./model/CookbookModel";
import { UserModel } from "./model/UserModel"; // Import the UserModel
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as passport from "passport";

declare global {
  namespace Express {
    interface User {
      id: string;
      displayName: string;
    }
  }
}

class App {
  public expressApp: express.Application;
  public DiscoverModel: DiscoverModel;
  public Cookbook: CookbookModel;
  public UserModel: UserModel;

  constructor(mongoDBConnection: string) {
    this.expressApp = express();
    this.DiscoverModel = new DiscoverModel(mongoDBConnection); // Single instance
    this.Cookbook = new CookbookModel(mongoDBConnection, this.DiscoverModel);
    this.UserModel = new UserModel(mongoDBConnection, this.Cookbook); // Pass the shared instance
    this.middleware();
    this.routes();
  }

  private validateAuth(req, res, next): void {
    if (req.isAuthenticated()) {
      console.log("User is authenticated");
      return next();
    }

    console.log("User is not authenticated");
    res.status(401).json({ error: "Unauthorized" });
  }

  private middleware(): void {
    this.expressApp.use(bodyParser.json());
    this.expressApp.use(bodyParser.urlencoded({ extended: false }));
    this.expressApp.use(
        (req: express.Request, res: express.Response, next: express.NextFunction) => {
          res.header("Access-Control-Allow-Origin", "http://localhost:4200");
          res.header(
              "Access-Control-Allow-Headers",
              "Origin, X-Requested-With, Content-Type, Accept"
          );
          res.header("Access-Control-Allow-Credentials", "true");
          next();
        }
    );

    this.expressApp.use(cookieParser());
    this.expressApp.use(
        session({
          secret: "1234567890QWERTY",
          resave: false,
          saveUninitialized: true,
        })
    );

    this.expressApp.use(passport.initialize());
    this.expressApp.use(passport.session());
  }

  private routes(): void {
    const router = express.Router();

    router.get(
        "/app/discover",
        async (req: express.Request, res: express.Response): Promise<void> => {
          await this.DiscoverModel.retrieveAllRecipes(res);
        }
    );

    router.get(
        "/app/discover/:recipeID",
        async (req: express.Request, res: express.Response): Promise<void> => {
          const recipeID: string = req.params.recipeID;
          await this.DiscoverModel.retrieveRecipe(res, recipeID);
        }
    );

    router.post(
        "/app/discover",
        async (req: express.Request, res: express.Response): Promise<void> => {
          const newRecipeData = req.body;
          await this.DiscoverModel.createRecipe(res, newRecipeData);
        }
    );

    router.delete(
        "/app/discover/:recipeID",
        async (req: express.Request, res: express.Response): Promise<void> => {
          const recipeID: string = req.params.recipeID;
          await this.DiscoverModel.deleteRecipe(res, recipeID);
        }
    );

    router.get("/app/cookbook", this.validateAuth, async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        await this.Cookbook.getAllCookbookRecipes(res, userId);
      } catch (error) {
        console.error("Error getting cookbook:", error);
        res.status(500).json({ error: "An error occurred while retrieving the cookbook." });
      }
    });

    router.get(
        "/app/auth/google/callback",
        passport.authenticate("google", { failureRedirect: "/" }),
        async (req, res) => {
          const googleUser = req.user;
          const user = await this.UserModel.findOrCreateUser(googleUser);
          console.log("User successfully authenticated:", user);
          res.redirect("http://localhost:4200/discover");
        }
    );

    router.get("/app/auth/check", (req, res) => {
      if (req.isAuthenticated()) {
        res.json({ loggedIn: true });
      } else {
        res.json({ loggedIn: false });
      }
    });

    router.get("/app/profile", this.validateAuth, async (req, res) => {
      try {
        const userId = req.user?.id;
        if (!userId) {
          return res.status(401).json({ error: "Unauthorized" });
        }
        const userProfile = await this.UserModel.getUserProfile(userId);
        if (!userProfile) {
          res.status(404).json({ error: "User not found" });
        } else {
          res.json(userProfile);
        }
      } catch (error) {
        console.error("Error retrieving profile:", error);
        res.status(500).json({ error: "An error occurred while retrieving the profile." });
      }
    });

    this.expressApp.use("/", router);
  }
}

export { App };

