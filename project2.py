from rasa_nlu.model import Metadata, Interpreter
interpreter = Interpreter.load(model_directory)
interpreter.parse("I am looking for an Italian Restaurant where I can eat")