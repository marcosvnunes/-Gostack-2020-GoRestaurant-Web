import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');
      if (response) {
        setFoods(response.data);
      }
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });
      if (response) {
        setFoods([...foods, response.data]);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const updated = await api.put(`/foods/${editingFood.id}`, {
      ...food,
      available: editingFood.available,
    });
    if (updated) {
      const index = foods.findIndex(item => item.id === editingFood.id);
      if (index >= 0) {
        foods[index] = updated.data;
        setFoods([...foods]);
      }
    }
  }

  async function handleDeleteFood(id: number): Promise<void> {
    const response = await api.delete(`/foods/${id}`);
    if (response.status === 204) {
      const newFoods = foods.filter(item => item.id !== id);
      setFoods(newFoods);
    }
  }

  async function handleToggleAvailable(id: number): Promise<void> {
    const index = foods.findIndex(item => item.id === id);
    const { available, ...rest } = foods[index];
    const response = await api.put(`/foods/${id}`, {
      ...rest,
      available: !available,
    });
    if (response) {
      foods[index] = response.data;
      setFoods([...foods]);
    }
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    // TODO SET THE CURRENT EDITING FOOD ID IN THE STATE
    setEditingFood(food);
    toggleEditModal();
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleToggleAvailable={handleToggleAvailable}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
