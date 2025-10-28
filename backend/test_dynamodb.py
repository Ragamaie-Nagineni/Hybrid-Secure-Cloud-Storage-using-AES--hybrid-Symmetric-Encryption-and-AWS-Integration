import boto3
dynamodb = boto3.resource('dynamodb', region_name='eu-north-1')
table = dynamodb.Table('securefinance_users')
response = table.scan()
print(response['Items'])
