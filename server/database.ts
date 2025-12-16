import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import path from 'path';

interface UserAttributes {
  id: number;
  session_uuid: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

interface LocationAttributes {
  id: number;
  address: string;
  canonical_lat: number;
  canonical_lng: number;
}

interface LocationCreationAttributes extends Optional<LocationAttributes, 'id'> {}

interface UserLocationAttributes {
  id: number;
  UserId: number;
  LocationId: number;
  click_lat: number;
  click_lng: number;
}
interface UserLocationCreationAttributes extends Optional<UserLocationAttributes, 'id'> {}

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  // When testing, we will use in-memory DB
  storage: process.env.NODE_ENV === 'test' ? ':memory:' : path.join(__dirname, 'database.sqlite'),
  logging: false
});

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public session_uuid!: string;
  
  // Timestamps automatically added by Sequelize
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  session_uuid: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, { sequelize, modelName: 'User' });

export class Location extends Model<LocationAttributes, LocationCreationAttributes> implements LocationAttributes {
  public id!: number;
  public address!: string;
  public canonical_lat!: number;
  public canonical_lng!: number;
}

Location.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  canonical_lat: { type: DataTypes.FLOAT },
  canonical_lng: { type: DataTypes.FLOAT }
}, { sequelize, modelName: 'Location' });

export class UserLocation extends Model<UserLocationAttributes, UserLocationCreationAttributes> implements UserLocationAttributes {
  public id!: number;
  public UserId!: number;
  public LocationId!: number;
  public click_lat!: number;
  public click_lng!: number;
}

UserLocation.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  UserId: { type: DataTypes.INTEGER, allowNull: false },
  LocationId: { type: DataTypes.INTEGER, allowNull: false },
  click_lat: { type: DataTypes.FLOAT, allowNull: false },
  click_lng: { type: DataTypes.FLOAT, allowNull: false }
}, { sequelize, modelName: 'UserLocation' });

// Model relationships
User.belongsToMany(Location, { through: UserLocation });
Location.belongsToMany(User, { through: UserLocation });
User.hasMany(UserLocation);
UserLocation.belongsTo(User);
UserLocation.belongsTo(Location);

// Initialize database on server start
export const initDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Database synced successfully (TypeScript).');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};