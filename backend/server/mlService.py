"""
Cricket Performance Prediction ML Service
Integrates batting and bowling performance prediction models
"""

import numpy as np
import pandas as pd
import pickle
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor
from xgboost import XGBRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CricketMLService:
    def __init__(self):
        self.batting_models = {}
        self.bowling_models = {}
        self.is_trained = False
        self.player_encodings = {}
        self.team_encodings = {}
        
        self._initialize_models()
        self._load_mock_data()
        self._train_models()
    
    def _initialize_models(self):
        self.batting_models = {
            'decision_tree': DecisionTreeRegressor(random_state=42),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'xgboost': XGBRegressor(random_state=42),
            'linear_regression': LinearRegression(),
            'knn': KNeighborsRegressor(n_neighbors=5),
            'svr': SVR(kernel='rbf')
        }
        
        self.bowling_models = {
            'decision_tree': DecisionTreeRegressor(random_state=42),
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'xgboost': XGBRegressor(random_state=42),
            'linear_regression': LinearRegression(),
            'knn': KNeighborsRegressor(n_neighbors=5),
            'svr': SVR(kernel='rbf')
        }
    
    def _load_mock_data(self):
        self.batting_data = pd.DataFrame({
            'Player': ['Virat Kohli', 'Rohit Sharma', 'Steve Smith', 'Joe Root', 'Kane Williamson',
                      'Babar Azam', 'David Warner', 'KL Rahul', 'Ben Stokes', 'Quinton de Kock'] * 50,
            'Opposition': ['Pakistan', 'Australia', 'England', 'India', 'New Zealand',
                          'South Africa', 'Sri Lanka', 'Bangladesh', 'West Indies', 'Afghanistan'] * 50,
            'BF': np.random.randint(20, 200, 500),  
            'Overs': np.random.uniform(3.0, 50.0, 500),  
            'Target': np.random.randint(150, 400, 500),  
            'Team_Runs': np.random.randint(200, 450, 500), 
            'Runs': np.random.randint(0, 150, 500),  
            'SR': np.random.uniform(50.0, 200.0, 500), 
            'Fours': np.random.randint(0, 20, 500),
            'Sixes': np.random.randint(0, 10, 500),
            'Result': np.random.choice(['won', 'lost'], 500),
            'Country': np.random.choice(['India', 'Australia', 'England', 'Pakistan', 'New Zealand'], 500)
        })
        self.bowling_data = pd.DataFrame({
            'player': ['Jasprit Bumrah', 'Pat Cummins', 'James Anderson', 'Mitchell Starc', 'Trent Boult',
                      'Kagiso Rabada', 'Mohammed Shami', 'Josh Hazlewood', 'Ravindra Jadeja', 'Nathan Lyon'] * 50,
            'team': ['India', 'Australia', 'England', 'Australia', 'New Zealand',
                    'South Africa', 'India', 'Australia', 'India', 'Australia'] * 50,
            'opposition': ['Pakistan', 'India', 'Australia', 'England', 'India',
                          'England', 'Australia', 'India', 'Australia', 'India'] * 50,
            'overs': np.random.uniform(5.0, 20.0, 500),
            'balls': np.random.randint(30, 120, 500),
            'maidens': np.random.randint(0, 8, 500),
            'conceded': np.random.randint(15, 100, 500),
            'wickets': np.random.randint(0, 6, 500),
            'economy': np.random.uniform(2.0, 8.0, 500),
            'dots': np.random.randint(10, 80, 500),
            'fours': np.random.randint(0, 15, 500),
            'sixes': np.random.randint(0, 5, 500),
            'wides': np.random.randint(0, 8, 500),
            'noballs': np.random.randint(0, 3, 500)
        })
        
        logger.info("Mock training data loaded successfully")
    
    def _prepare_batting_features(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        if not self.player_encodings:
            unique_players = data['Player'].unique()
            self.player_encodings = {player: idx for idx, player in enumerate(unique_players)}
            
            unique_oppositions = data['Opposition'].unique()
            self.team_encodings = {team: idx for idx, team in enumerate(unique_oppositions)}
        features = data.copy()
        features['Player_encoded'] = features['Player'].map(self.player_encodings).fillna(0)
        features['Opposition_encoded'] = features['Opposition'].map(self.team_encodings).fillna(0)
        X = features[['Player_encoded', 'Opposition_encoded', 'BF', 'Overs']]
        y = features['Runs']
        return X, y

    def _prepare_bowling_features(self, data: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        features = data.copy()
        features['team_encoded'] = pd.Categorical(features['team']).codes
        features['opposition_encoded'] = pd.Categorical(features['opposition']).codes
        X = features[['team_encoded', 'opposition_encoded', 'overs', 'balls', 'maidens', 
                     'conceded', 'economy', 'dots', 'fours', 'sixes', 'wides', 'noballs']]
        y = features['wickets']
        return X, y
    
    def _train_models(self):
        try:
            X_bat, y_bat = self._prepare_batting_features(self.batting_data)
            X_bat_train, X_bat_test, y_bat_train, y_bat_test = train_test_split(
                X_bat, y_bat, test_size=0.2, random_state=42
            )
            
            batting_scores = {}
            for name, model in self.batting_models.items():
                model.fit(X_bat_train, y_bat_train)
                score = model.score(X_bat_test, y_bat_test)
                batting_scores[name] = score
                logger.info(f"Batting {name} score: {score:.4f}")
            X_bowl, y_bowl = self._prepare_bowling_features(self.bowling_data)
            X_bowl_train, X_bowl_test, y_bowl_train, y_bowl_test = train_test_split(
                X_bowl, y_bowl, test_size=0.2, random_state=42
            )
            
            bowling_scores = {}
            for name, model in self.bowling_models.items():
                model.fit(X_bowl_train, y_bowl_train)
                score = model.score(X_bowl_test, y_bowl_test)
                bowling_scores[name] = score
                logger.info(f"Bowling {name} score: {score:.4f}")
            
            self.is_trained = True
            logger.info("All models trained successfully")
            
            return {
                'batting_scores': batting_scores,
                'bowling_scores': bowling_scores
            }
            
        except Exception as e:
            logger.error(f"Error training models: {str(e)}")
            return None
    
    def predict_batting_performance(self, 
                                   player_name: str, 
                                   opposition: str, 
                                   balls_faced: int, 
                                   overs: float,
                                   model_type: str = 'random_forest') -> Dict[str, Any]:
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        try:
            player_encoded = self.player_encodings.get(player_name, 0)
            opposition_encoded = self.team_encodings.get(opposition, 0)
            input_features = np.array([[player_encoded, opposition_encoded, balls_faced, overs]])
            if model_type not in self.batting_models:
                model_type = 'random_forest'  
            model = self.batting_models[model_type]
            predicted_runs = model.predict(input_features)[0]
            all_predictions = {}
            for name, mdl in self.batting_models.items():
                all_predictions[name] = mdl.predict(input_features)[0]
            ensemble_prediction = np.mean(list(all_predictions.values()))
            prediction_variance = np.var(list(all_predictions.values()))
            confidence = max(0.5, 1.0 - (prediction_variance / 100))
            insights = self._generate_batting_insights(
                player_name, opposition, predicted_runs, balls_faced, overs
            )
            
            return {
                'player': player_name,
                'opposition': opposition,
                'predicted_runs': max(0, int(predicted_runs)),
                'ensemble_prediction': max(0, int(ensemble_prediction)),
                'confidence': min(1.0, confidence),
                'model_used': model_type,
                'all_predictions': {k: max(0, int(v)) for k, v in all_predictions.items()},
                'insights': insights,
                'input_parameters': {
                    'balls_faced': balls_faced,
                    'overs': overs
                }
            }
            
        except Exception as e:
            logger.error(f"Error in batting prediction: {str(e)}")
            return {'error': str(e)}
    
    def predict_bowling_performance(self, 
                                   player_name: str, 
                                   team: str,
                                   opposition: str, 
                                   overs: float,
                                   model_type: str = 'random_forest') -> Dict[str, Any]:
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        try:
            team_encoded = hash(team) % 10
            opposition_encoded = hash(opposition) % 10
            balls = int(overs * 6)
            estimated_maidens = max(0, int(overs * 0.2))  # 20% maidens estimate
            estimated_conceded = int(overs * 6)  # 6 runs per over estimate
            estimated_economy = 6.0  # baseline economy
            estimated_dots = int(balls * 0.4)  # 40% dot balls
            estimated_fours = max(0, int(overs * 0.5))
            estimated_sixes = max(0, int(overs * 0.2))
            estimated_wides = max(0, int(overs * 0.3))
            estimated_noballs = max(0, int(overs * 0.1))
            
            # Prepare input features
            input_features = np.array([[
                team_encoded, opposition_encoded, overs, balls, estimated_maidens,
                estimated_conceded, estimated_economy, estimated_dots, 
                estimated_fours, estimated_sixes, estimated_wides, estimated_noballs
            ]])
            
            # Get prediction from specified model
            if model_type not in self.bowling_models:
                model_type = 'random_forest'  # fallback
            
            model = self.bowling_models[model_type]
            predicted_wickets = model.predict(input_features)[0]
            
            # Get predictions from all models for ensemble
            all_predictions = {}
            for name, mdl in self.bowling_models.items():
                all_predictions[name] = mdl.predict(input_features)[0]
            
            # Calculate ensemble prediction
            ensemble_prediction = np.mean(list(all_predictions.values()))
            
            # Calculate confidence
            prediction_variance = np.var(list(all_predictions.values()))
            confidence = max(0.5, 1.0 - (prediction_variance / 10))
            
            # Generate performance insights
            insights = self._generate_bowling_insights(
                player_name, team, opposition, predicted_wickets, overs
            )
            
            return {
                'player': player_name,
                'team': team,
                'opposition': opposition,
                'predicted_wickets': max(0, int(predicted_wickets)),
                'ensemble_prediction': max(0, int(ensemble_prediction)),
                'confidence': min(1.0, confidence),
                'model_used': model_type,
                'all_predictions': {k: max(0, int(v)) for k, v in all_predictions.items()},
                'insights': insights,
                'input_parameters': {
                    'overs': overs,
                    'estimated_economy': estimated_economy
                }
            }
            
        except Exception as e:
            logger.error(f"Error in bowling prediction: {str(e)}")
            return {'error': str(e)}
    
    def _generate_batting_insights(self, player: str, opposition: str, 
                                  predicted_runs: float, balls_faced: int, overs: float) -> List[str]:
        """Generate batting performance insights"""
        insights = []
        
        predicted_sr = (predicted_runs / balls_faced) * 100 if balls_faced > 0 else 0
        
        if predicted_runs > 50:
            insights.append(f"High scoring potential - predicted {int(predicted_runs)} runs")
        elif predicted_runs > 25:
            insights.append(f"Solid contribution expected - around {int(predicted_runs)} runs")
        else:
            insights.append(f"Conservative approach recommended - {int(predicted_runs)} runs predicted")
        
        if predicted_sr > 100:
            insights.append("Aggressive batting approach suggested")
        elif predicted_sr > 75:
            insights.append("Balanced batting approach recommended")
        else:
            insights.append("Cautious batting approach advised")
        
        insights.append(f"Against {opposition}, focus on building innings")
        
        return insights
    
    def _generate_bowling_insights(self, player: str, team: str, opposition: str, 
                                  predicted_wickets: float, overs: float) -> List[str]:
        """Generate bowling performance insights"""
        insights = []
        
        wicket_rate = predicted_wickets / overs if overs > 0 else 0
        
        if predicted_wickets >= 3:
            insights.append(f"Excellent wicket-taking opportunity - {int(predicted_wickets)} wickets predicted")
        elif predicted_wickets >= 2:
            insights.append(f"Good bowling performance expected - {int(predicted_wickets)} wickets")
        elif predicted_wickets >= 1:
            insights.append(f"Breakthrough opportunity - {int(predicted_wickets)} wicket predicted")
        else:
            insights.append("Focus on economy and building pressure")
        
        if wicket_rate > 0.3:
            insights.append("High strike rate bowling recommended")
        else:
            insights.append("Economy-focused bowling strategy suggested")
        
        insights.append(f"Against {opposition}, vary pace and line")
        
        return insights
    
    def get_model_performance(self) -> Dict[str, Any]:
        """Get performance metrics of all models"""
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        return {
            'batting_models': list(self.batting_models.keys()),
            'bowling_models': list(self.bowling_models.keys()),
            'is_trained': self.is_trained,
            'player_encodings_count': len(self.player_encodings),
            'team_encodings_count': len(self.team_encodings)
        }
    
    def batch_predict(self, predictions_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Perform batch predictions for multiple players"""
        results = []
        
        for data in predictions_data:
            if data.get('type') == 'batting':
                result = self.predict_batting_performance(
                    data['player'], data['opposition'], 
                    data['balls_faced'], data['overs']
                )
            elif data.get('type') == 'bowling':
                result = self.predict_bowling_performance(
                    data['player'], data['team'], data['opposition'], data['overs']
                )
            else:
                result = {'error': 'Invalid prediction type'}
            
            results.append(result)
        
        return results
    
    def save_models(self, filepath: str = 'cricket_ml_models.pkl'):
        """Save trained models to file"""
        try:
            model_data = {
                'batting_models': self.batting_models,
                'bowling_models': self.bowling_models,
                'player_encodings': self.player_encodings,
                'team_encodings': self.team_encodings,
                'is_trained': self.is_trained
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Models saved to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")
            return False
    
    def load_models(self, filepath: str = 'cricket_ml_models.pkl'):
        """Load trained models from file"""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.batting_models = model_data['batting_models']
            self.bowling_models = model_data['bowling_models']
            self.player_encodings = model_data['player_encodings']
            self.team_encodings = model_data['team_encodings']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"Models loaded from {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False

# Global ML service instance
ml_service = CricketMLService()

# API helper functions for integration
def predict_player_batting(player_name: str, opposition: str, balls_faced: int, overs: float) -> Dict[str, Any]:
    """API function for batting prediction"""
    return ml_service.predict_batting_performance(player_name, opposition, balls_faced, overs)

def predict_player_bowling(player_name: str, team: str, opposition: str, overs: float) -> Dict[str, Any]:
    """API function for bowling prediction"""
    return ml_service.predict_bowling_performance(player_name, team, opposition, overs)

def get_ml_service_status() -> Dict[str, Any]:
    """Get ML service status"""
    return ml_service.get_model_performance()

if __name__ == "__main__":
    # Test the ML service
    print("Testing Cricket ML Service...")
    
    # Test batting prediction
    batting_result = predict_player_batting("Virat Kohli", "Australia", 100, 16.4)
    print("Batting Prediction:", json.dumps(batting_result, indent=2))
    
    # Test bowling prediction
    bowling_result = predict_player_bowling("Jasprit Bumrah", "India", "Australia", 10.0)
    print("Bowling Prediction:", json.dumps(bowling_result, indent=2))
    
    # Get service status
    status = get_ml_service_status()
    print("Service Status:", json.dumps(status, indent=2))