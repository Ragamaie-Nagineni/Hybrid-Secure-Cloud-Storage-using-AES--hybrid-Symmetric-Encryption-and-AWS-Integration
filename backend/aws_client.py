import boto3

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')

# Table name you created in AWS console
TABLE_NAME = 'drakz_users'

# Reference to your DynamoDB table
user_table = dynamodb.Table(TABLE_NAME)
