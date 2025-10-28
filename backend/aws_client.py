import boto3

dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
TABLE_NAME = 'securefinance_users'
user_table = dynamodb.Table(TABLE_NAME)
